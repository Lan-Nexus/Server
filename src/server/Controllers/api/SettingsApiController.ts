import { Request, Response } from 'express';
import SettingsModel from '../../Models/Settings.js';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export default class SettingsApiController {
  /**
   * Get all settings
   */
  async getAll(req: Request, res: Response) {
    try {
      const settings = await SettingsModel.getAll();
      res.json(settings);
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific setting by key
   */
  async get(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const value = await SettingsModel.get(key);

      if (value === null) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Setting not found',
          key
        });
      }

      res.json({ key, value });
    } catch (error) {
      console.error('Error getting setting:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get setting',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update settings
   */
  async update(req: Request, res: Response) {
    try {
      const updates = req.body;

      // Update each setting
      for (const [key, value] of Object.entries(updates)) {
        await SettingsModel.set(key, value as string);
      }

      console.log('✅ Settings updated:', Object.keys(updates).join(', '));

      const allSettings = await SettingsModel.getAll();
      res.json(allSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get server name specifically
   */
  async getServerName(req: Request, res: Response) {
    try {
      const name = await SettingsModel.getServerName();
      res.json({ serverName: name });
    } catch (error) {
      console.error('Error getting server name:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get server name',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get branding information (server name and logo)
   */
  async getBranding(req: Request, res: Response) {
    try {
      const serverName = await SettingsModel.getServerName();
      const logo = await SettingsModel.get('server_logo');
      
      res.json({ 
        serverName,
        logo: logo || null
      });
    } catch (error) {
      console.error('Error getting branding:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get branding',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get upload middleware for logo uploads
   */
  getUploadMiddleware() {
    const upload = multer({
      dest: path.join(process.cwd(), 'public', 'settings', 'temp'),
    });
    return upload.single('logo');
  }

  /**
   * Upload and save server logo
   */
  async uploadLogo(req: any, res: Response) {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'No file uploaded'
        });
      }

      const uploadDir = path.join(process.cwd(), 'public', 'settings', 'logos');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname) || '.png';
      const filename = `server-logo${ext}`;
      const finalPath = path.join(uploadDir, filename);

      // Move file from temp to final location
      fs.renameSync(req.file.path, finalPath);

      // Save the relative path to settings
      const relativePath = `/settings/logos/${filename}`;
      await SettingsModel.set('server_logo', relativePath);

      console.log('✅ Server logo uploaded:', relativePath);

      res.json({
        success: true,
        logo: relativePath
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to upload logo',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
