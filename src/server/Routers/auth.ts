import { Router } from 'express';
import dayjs from 'dayjs';
import UserModel from '../Models/User.js';
import { z } from 'zod';
import { signJwt } from '../jwt.js';

const router = Router();

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
