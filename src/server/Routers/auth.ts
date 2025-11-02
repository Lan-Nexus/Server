import { Router } from 'express';
import dayjs from 'dayjs';
import UserModel from '../Models/User.js';
import { z } from 'zod';
import { signJwt } from '../jwt.js';

const router = Router();

// Setup check endpoint - checks if any users exist in the system
router.get('/setup/check', async (req: any, res: any) => {
  try {
    const users = await UserModel.list();
    const needsSetup = users.length === 0;

    res.json({ needsSetup });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check setup status' });
  }
});

// Setup endpoint - creates the first admin user (only works if no users exist)
router.post('/setup', async (req: any, res: any) => {
  try {
    const setupSchema = z.object({
      name: z.string().min(1, "Name is required"),
      clientId: z.string().min(1, "Client ID is required"),
      password: z.string().min(6, "Password must be at least 6 characters")
    });

    const { name, clientId, password } = await setupSchema.parseAsync(req.body);

    // Check if any users already exist
    const existingUsers = await UserModel.list();
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Setup has already been completed. Users already exist in the system.' });
    }

    // Check if the clientId is already taken (shouldn't happen since no users exist, but just in case)
    const existingUser = await UserModel.findByClientId(clientId);
    if (existingUser) {
      return res.status(400).json({ error: 'Client ID already exists' });
    }

    // Create the first admin user
    const userData = {
      name,
      clientId,
      password,
      role: 'admin'
    };

    const user = await UserModel.create(userData);

    // Generate JWT token for the new admin user
    const authTime = Number(process.env.AUTH_TIME) || 1;
    const expires = dayjs().add(authTime, 'hour');
    const expiresIn = expires.diff(dayjs(), 'seconds');
    const token = signJwt({
      clientId: user.clientId,
      userId: user.id,
      role: user.role
    }, expiresIn);

    res.json({
      message: 'Setup completed successfully',
      token,
      expires: expires.toISOString(),
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        clientId: user.clientId,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(400).json({ error: (error as Error).message || 'Setup failed' });
  }
});

// User authentication endpoint (doesn't require JWT)
router.post('/login', async (req: any, res: any) => {
  try {
    const loginSchema = z.object({
      clientId: z.string().min(1, "Client ID is required"),
      password: z.string().min(1, "Password is required"),
    });

    const { clientId, password } = await loginSchema.parseAsync(req.body);

    const user = await UserModel.authenticate(clientId, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const authTime = Number(process.env.AUTH_TIME) || 1;
    const expires = dayjs().add(authTime, 'hour');
    const expiresIn = expires.diff(dayjs(), 'seconds');
    const token = signJwt({
      clientId: user.clientId,
      userId: user.id,
      role: user.role || 'user'
    }, expiresIn);

    res.json({
      token,
      expires: expires.toISOString(),
      role: user.role || 'user',
      user: {
        id: user.id,
        name: user.name,
        clientId: user.clientId,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message || 'Invalid request' });
  }
});

export default router;
