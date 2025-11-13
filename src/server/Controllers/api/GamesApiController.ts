import {
  gamesInsertSchema,
  gamesSelectSchema,
  gamesUpdateSchema,
} from "../../db/schema.js";
import GameModel from "../../Models/Game.js";
import GameKeyModel from "../../Models/GameKey.js";
import { Request, Response } from "express";
import { PageController } from "../PageController.js";
import path from "path";
import fs from "fs";


async function uploadFiles(body: any, location: string, fields: string[], files: Record<string, Express.Multer.File[]>) {
  const uploadDir = path.join(process.cwd(), location);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  for (const field of fields) {
    const fileArray = files[field];
    if (fileArray && fileArray[0]) {
      const file = fileArray[0];
      const ext = path.extname(file.originalname) || ".png";
      const fileName = `${field}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.promises.rename(file.path, filePath);
      // Save relative path for use in frontend/static serving
      body[field] = `/${location.replace(/^public\//, "")}/${fileName}`;
    }
  }
  return body;
}

export default class GamesController extends PageController {
  constructor() {
    super(GameModel, gamesSelectSchema, gamesInsertSchema, gamesUpdateSchema);
  }

  async postList(req: Request, res: Response, games: any[]) {
    for (const game of games) {
      game.keys = await GameKeyModel.listByGame(game.id);
      if (typeof req.query.clientId === "string") {
        game.gamekey = await GameKeyModel.myKey(game.id, req.query.clientId);
      }
      // Parse executables JSON string to array for client
      if (game.executables && typeof game.executables === 'string') {
        try {
          game.executables = JSON.parse(game.executables);
        } catch (e) {
          console.error(`Failed to parse executables for game ${game.id}:`, e);
          game.executables = null;
        }
      }
    }
  }


  public async mapRequestBody(body: any, req: Request, res: Response) {
    if (body.id) {
      body.id = Number(body.id);
    }

    // Handle executables field - convert array to JSON string for storage
    if (body.executables) {
      console.log('Received executables:', body.executables, 'Type:', typeof body.executables);
      if (Array.isArray(body.executables)) {
        body.executables = JSON.stringify(body.executables);
        console.log('Converted array to JSON string:', body.executables);
      } else if (typeof body.executables === 'string') {
        // Validate it's valid JSON
        try {
          const parsed = JSON.parse(body.executables);
          if (!Array.isArray(parsed)) {
            throw new Error('Executables must be an array');
          }
          console.log('Valid JSON string with array:', parsed);
        } catch (e) {
          console.error('Invalid executables format:', e);
          delete body.executables; // Remove invalid data
        }
      }
    } else {
      console.log('No executables field in body');
    }

    const imageFields = ["icon", "logo", "headerImage", "imageCard", "heroImage", "archives"];

    // Only download images if they're URLs (not handled by multer)
    for (const field of imageFields) {
      if (body[field] && typeof body[field] === 'string' && (body[field].startsWith('http://') || body[field].startsWith('https://'))) {
        body[field] = await this.downloadImage(body[field], field);
      }
    }

    body.needsKey = Number(body.needsKey);
    if (req.files) {
      body = await uploadFiles(
        body,
        path.join("public", "games", "images", "uploads"),
        ["icon", "logo", "headerImage", "imageCard", "heroImage"],
        req.files as Record<string, Express.Multer.File[]>
      );

      body = await uploadFiles(
        body,
        path.join("public", "games", "archives"),
        ["archives"],
        req.files as Record<string, Express.Multer.File[]>
      );
    }

    return body;
  }

  private async downloadImage(url: string, type: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!url) {
        reject(new Error("No URL provided for image download"));
        return;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();
        const extPart = url.split('.').pop();
        const ext = extPart ? extPart.split(/\#|\?/)[0] : 'jpg';
        const name = `${type}-${Date.now()}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "games", "images", "uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        fs.writeFileSync(path.join(uploadDir, name), Buffer.from(await blob.arrayBuffer()));
        resolve(`/games/images/uploads/${name}`);
      } catch (error) {
        console.error(`Error downloading image from ${url}:`, error);
        reject(error);
      }
    });
  }
}
