import { Request, Response } from 'express';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { PassThrough, Readable } from 'stream';

const GITHUB_OWNER = 'Lan-Nexus';
const GITHUB_REPO = 'Client';
const CACHE_DIR = path.join(process.cwd(), 'cache', 'updates');

// Track in-progress downloads to support multiple simultaneous clients
interface DownloadState {
  passThrough: PassThrough;
  clients: Array<{ res: Response; stream: PassThrough }>;
  cacheStream: fs.WriteStream;
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

    // Validate platform
    if (!['win32', 'darwin', 'linux'].includes(platform)) {
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

    console.log(`✅ Served update feed for ${platform}, version: ${release.tag_name}`);
  } catch (error) {
    console.error('❌ Error serving update feed:', error);
    res.status(500).json({
      error: 'Failed to fetch update information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Downloads a file from GitHub and streams it to multiple clients simultaneously
 * First client triggers download, subsequent clients join the same stream
 */
async function streamFromGitHub(filename: string, res: Response) {
  // Check if download is already in progress
  const existingDownload = activeDownloads.get(filename);

  if (existingDownload) {
    console.log(`📡 Joining existing download stream for: ${filename}`);

    // Create a new PassThrough stream for this client
    const clientStream = new PassThrough();
    existingDownload.clients.push({ res, stream: clientStream });

    // Pipe the main stream to this client's stream
    existingDownload.passThrough.pipe(clientStream);

    // Set headers and pipe to response
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    clientStream.pipe(res);

    // Wait for download to complete
    await existingDownload.promise;
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

  // Create streams
  const passThrough = new PassThrough();
  const cacheStream = fs.createWriteStream(tempPath);
  const clientStream = new PassThrough();

  // Track this download
  const downloadState: DownloadState = {
    passThrough,
    clients: [{ res, stream: clientStream }],
    cacheStream,
    promise: (async () => {
      try {
        // Start download from GitHub
        const response = await axios.get(asset.browser_download_url, {
          responseType: 'stream',
          headers: {
            'User-Agent': 'Lan-Nexus-Update-Server'
          }
        });

        const githubStream = response.data as Readable;

        // Set headers for the first client
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', response.headers['content-length'] || '');

        // Pipe GitHub stream to passThrough
        // passThrough will broadcast to all connected clients AND cache file
        githubStream.pipe(passThrough);

        // Pipe passThrough to cache file
        passThrough.pipe(cacheStream);

        // Pipe passThrough to first client
        passThrough.pipe(clientStream);
        clientStream.pipe(res);

        // Wait for download to complete
        await new Promise<void>((resolve, reject) => {
          cacheStream.on('finish', () => {
            console.log(`✅ Download complete, cached: ${filename}`);

            // Rename temp file to final cache file
            fs.renameSync(tempPath, cachePath);

            // Close all client streams
            downloadState.clients.forEach(client => {
              client.stream.end();
            });

            resolve();
          });

          cacheStream.on('error', (err) => {
            console.error(`❌ Cache write error for ${filename}:`, err);

            // Clean up temp file
            if (fs.existsSync(tempPath)) {
              fs.unlinkSync(tempPath);
            }

            // Close all client streams with error
            downloadState.clients.forEach(client => {
              client.stream.destroy(err);
            });

            reject(err);
          });

          githubStream.on('error', (err) => {
            console.error(`❌ GitHub stream error for ${filename}:`, err);
            reject(err);
          });
        });
      } catch (error) {
        console.error(`❌ Download failed for ${filename}:`, error);

        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }

        throw error;
      } finally {
        // Remove from active downloads
        activeDownloads.delete(filename);
      }
    })()
  };

  // Register this download
  activeDownloads.set(filename, downloadState);

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

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);

    if (sanitizedFilename !== filename) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const cachePath = path.join(CACHE_DIR, sanitizedFilename);

    // Check if file exists in cache
    if (fs.existsSync(cachePath)) {
      console.log(`📦 Serving from cache: ${sanitizedFilename}`);

      const stat = fs.statSync(cachePath);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
      res.setHeader('Content-Length', stat.size.toString());

      const fileStream = fs.createReadStream(cachePath);
      fileStream.pipe(res);
      return;
    }

    // File not in cache, stream from GitHub (and cache it)
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
  try {
    const release = await getLatestReleaseFromGitHub();
    const version = release.tag_name;
    const assets = release.assets.map((a: any) => a.name);

    res.json({
      message: 'Latest release information fetched',
      version,
      assets,
      cacheDir: CACHE_DIR
    });
  } catch (error) {
    console.error('❌ Error syncing updates:', error);
    res.status(500).json({
      error: 'Failed to sync updates',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
