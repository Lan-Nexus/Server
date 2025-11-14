import { Request, Response } from 'express';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { PassThrough, Readable } from 'stream';

const GITHUB_OWNER = 'Lan-Nexus';
const GITHUB_REPO = 'Client';
const CACHE_DIR = path.join(process.cwd(), 'cache', 'updates');

// Track in-progress downloads with in-memory buffering
// Subsequent clients get buffered chunks first, then continue streaming
interface DownloadState {
  buffer: Buffer[];
  bufferSize: number;
  contentLength: string;
  filename: string;
  cacheStream: fs.WriteStream;
  downloadComplete: boolean;
  clients: Array<{ res: Response; currentChunk: number }>;
  promise: Promise<void>;
}

const activeDownloads = new Map<string, DownloadState>();

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Fetches the latest release info from GitHub
 */
async function getLatestReleaseFromGitHub() {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Lan-Nexus-Update-Server',
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  return response.data;
}

/**
 * Generates a platform-specific update feed file (yml format)
 * Modifies URLs to point to local server instead of GitHub
 */
function generateUpdateFeed(release: any, platform: string, serverUrl: string): string {
  const version = release.tag_name.replace(/^v/, '');
  const releaseDate = release.published_at;

  // Find the appropriate asset for this platform
  let assetName = '';
  let assetUrl = '';

  for (const asset of release.assets) {
    const name = asset.name.toLowerCase();

    if (platform === 'win32' && name.endsWith('.exe')) {
      assetName = asset.name;
      assetUrl = asset.browser_download_url;
      break;
    } else if (platform === 'darwin' && (name.endsWith('.dmg') || name.endsWith('.zip'))) {
      assetName = asset.name;
      assetUrl = asset.browser_download_url;
      break;
    } else if (platform === 'linux' && (name.endsWith('.AppImage') || name.endsWith('.deb'))) {
      assetName = asset.name;
      assetUrl = asset.browser_download_url;
      break;
    }
  }

  if (!assetName) {
    throw new Error(`No suitable asset found for platform: ${platform}`);
  }

  // Get file size from asset
  const fileSize = release.assets.find((a: any) => a.name === assetName)?.size || 0;

  // Generate local URL for the asset
  const localUrl = `${serverUrl}/api/updates/download/${encodeURIComponent(assetName)}`;

  // Generate yml format feed file
  // Format matches electron-updater expectations
  const yml = `version: ${version}
releaseDate: ${releaseDate}
path: ${assetName}
sha512: ""
url: ${localUrl}
`;

  return yml;
}

/**
 * Serves the update feed file (latest.yml, latest-mac.yml, latest-linux.yml)
 * Proxies GitHub release info but modifies URLs to point to local server
 */
export async function getUpdateFeed(req: Request, res: Response) {
  try {
    const { platform } = req.params;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    console.log(`📋 Update feed requested for ${platform} from ${clientIp}`);

    // Validate platform
    if (!['win32', 'darwin', 'linux'].includes(platform)) {
      console.log(`❌ Invalid platform requested: ${platform} from ${clientIp}`);
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Fetch latest release from GitHub
    const release = await getLatestReleaseFromGitHub();

    // Get server URL from request
    const protocol = req.protocol;
    const host = req.get('host');
    const serverUrl = `${protocol}://${host}`;

    // Generate feed file
    const feedContent = generateUpdateFeed(release, platform, serverUrl);

    // Send as text/plain (yml format)
    res.setHeader('Content-Type', 'text/plain');
    res.send(feedContent);

    console.log(`✅ Served update feed for ${platform}, version: ${release.tag_name} to ${clientIp}`);
  } catch (error) {
    console.error('❌ Error serving update feed:', error);
    res.status(500).json({
      error: 'Failed to fetch update information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Downloads a file from GitHub with in-memory buffering
 * Subsequent clients get buffered chunks first, then continue streaming
 */
async function streamFromGitHub(filename: string, res: Response) {
  // Check if download is already in progress
  const existingDownload = activeDownloads.get(filename);

  if (existingDownload) {
    console.log(`📡 Joining existing download (${existingDownload.buffer.length} chunks buffered) for: ${filename}`);

    // Add this client to the list
    const clientInfo = { res, currentChunk: 0 };
    existingDownload.clients.push(clientInfo);

    // Set headers with Content-Length so client shows proper progress
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', existingDownload.contentLength);

    try {
      // Send all buffered chunks immediately
      for (let i = 0; i < existingDownload.buffer.length; i++) {
        if (!res.write(existingDownload.buffer[i])) {
          // Backpressure - wait for drain
          await new Promise(resolve => res.once('drain', resolve));
        }
        clientInfo.currentChunk = i + 1;
      }

      // If download is still in progress, wait for new chunks
      if (!existingDownload.downloadComplete) {
        // Wait for download to complete
        await existingDownload.promise;
      }

      // Send any remaining chunks (if we joined very late)
      for (let i = clientInfo.currentChunk; i < existingDownload.buffer.length; i++) {
        if (!res.write(existingDownload.buffer[i])) {
          await new Promise(resolve => res.once('drain', resolve));
        }
      }

      res.end();
      console.log(`✅ Served ${filename} to joined client (${existingDownload.bufferSize} bytes)`);
    } catch (error) {
      console.error(`❌ Error serving to joined client:`, error);
      if (!res.headersSent) {
        res.status(500).end();
      }
    }

    return;
  }

  // Start new download
  console.log(`⬇️  Starting new download from GitHub: ${filename}`);

  // Get the download URL from latest release
  const release = await getLatestReleaseFromGitHub();
  const asset = release.assets.find((a: any) => a.name === filename);

  if (!asset) {
    throw new Error(`Asset not found: ${filename}`);
  }

  // Create cache file path
  const cachePath = path.join(CACHE_DIR, filename);
  const tempPath = `${cachePath}.tmp`;

  // Create cache write stream
  const cacheStream = fs.createWriteStream(tempPath);

  // Start download from GitHub to get content length
  const response = await axios.get(asset.browser_download_url, {
    responseType: 'stream',
    headers: {
      'User-Agent': 'Lan-Nexus-Update-Server'
    }
  });

  const githubStream = response.data as Readable;
  const contentLength = response.headers['content-length'] || '';

  console.log(`📦 Downloading ${filename} (${contentLength} bytes)`);

  // Track this download with buffering
  const downloadState: DownloadState = {
    buffer: [],
    bufferSize: 0,
    contentLength,
    filename,
    cacheStream,
    downloadComplete: false,
    clients: [{ res, currentChunk: 0 }],
    promise: Promise.resolve() // Will be set below
  };

  // Register this download BEFORE starting the stream
  // This allows subsequent clients to join while we're setting up
  activeDownloads.set(filename, downloadState);

  // Now start the actual download promise
  downloadState.promise = (async () => {
      try {
        // Set headers for the first client
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', contentLength);

        // Process chunks as they arrive
        githubStream.on('data', (chunk: Buffer) => {
          // Add to buffer for subsequent clients
          downloadState.buffer.push(chunk);
          downloadState.bufferSize += chunk.length;

          // Write to cache file
          cacheStream.write(chunk);

          // Send to all connected clients
          downloadState.clients.forEach(client => {
            if (client.currentChunk === downloadState.buffer.length - 1) {
              // This client is caught up, send this new chunk
              client.res.write(chunk);
              client.currentChunk++;
            }
          });
        });

        // Wait for download to complete
        await new Promise<void>((resolve, reject) => {
          githubStream.on('end', () => {
            console.log(`✅ Download complete: ${filename} (${downloadState.bufferSize} bytes, ${downloadState.buffer.length} chunks)`);
            downloadState.downloadComplete = true;

            // Close cache stream
            cacheStream.end();

            // End all client responses
            downloadState.clients.forEach(client => {
              client.res.end();
            });

            resolve();
          });

          githubStream.on('error', (err) => {
            console.error(`❌ GitHub stream error for ${filename}:`, err);
            reject(err);
          });

          cacheStream.on('error', (err) => {
            console.error(`❌ Cache write error for ${filename}:`, err);
            reject(err);
          });
        });

        // Wait for cache stream to finish
        await new Promise<void>((resolve, reject) => {
          cacheStream.on('finish', () => {
            // Rename temp file to final cache file
            fs.renameSync(tempPath, cachePath);
            console.log(`💾 Cached: ${filename}`);
            resolve();
          });

          cacheStream.on('error', reject);
        });

      } catch (error) {
        console.error(`❌ Download failed for ${filename}:`, error);

        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }

        // Send error to all connected clients
        downloadState.clients.forEach(client => {
          if (!client.res.headersSent) {
            client.res.status(500).end();
          } else {
            client.res.end();
          }
        });

        throw error;
      } finally {
        // Remove from active downloads after a delay (allow late joiners to still get buffered data)
        setTimeout(() => {
          activeDownloads.delete(filename);
          console.log(`🗑️  Cleared buffer for ${filename}`);
        }, 5000);
      }
    })();

  // Wait for completion
  await downloadState.promise;
}

/**
 * Serves installer files - from cache if available, otherwise downloads from GitHub
 * Supports streaming to multiple clients during download
 */
export async function downloadFile(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    console.log(`📥 Download requested: ${filename} from ${clientIp}`);

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);

    if (sanitizedFilename !== filename) {
      console.log(`❌ Invalid filename (directory traversal attempt): ${filename} from ${clientIp}`);
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const cachePath = path.join(CACHE_DIR, sanitizedFilename);

    // Check if file exists in cache
    if (fs.existsSync(cachePath)) {
      const stat = fs.statSync(cachePath);
      console.log(`📦 Serving ${sanitizedFilename} from cache (${stat.size} bytes) to ${clientIp}`);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
      res.setHeader('Content-Length', stat.size.toString());

      const fileStream = fs.createReadStream(cachePath);
      fileStream.pipe(res);

      // Log when complete
      fileStream.on('end', () => {
        console.log(`✅ Completed serving ${sanitizedFilename} from cache to ${clientIp}`);
      });

      return;
    }

    // File not in cache, stream from GitHub (and cache it)
    console.log(`🌐 File not in cache, downloading from GitHub: ${sanitizedFilename}`);
    await streamFromGitHub(sanitizedFilename, res);

  } catch (error) {
    console.error('❌ Error serving file:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to download file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

/**
 * Health check endpoint for clients to detect if server is available
 */
export async function healthCheck(req: Request, res: Response) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  console.log(`💚 Health check from ${clientIp}`);

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'lan-nexus-update-server'
  });
}

/**
 * Manual sync endpoint to pre-cache updates (admin only)
 */
export async function syncUpdates(req: Request, res: Response) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    console.log(`🔄 Manual sync requested from ${clientIp}`);

    const release = await getLatestReleaseFromGitHub();
    const version = release.tag_name;
    const assets = release.assets.map((a: any) => a.name);

    console.log(`✅ Sync complete: version ${version}, ${assets.length} assets available`);
    console.log(`   Assets: ${assets.join(', ')}`);

    res.json({
      message: 'Latest release information fetched',
      version,
      assets,
      cacheDir: CACHE_DIR
    });
  } catch (error) {
    console.error(`❌ Error syncing updates from ${clientIp}:`, error);
    res.status(500).json({
      error: 'Failed to sync updates',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
