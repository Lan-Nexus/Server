import 'dotenv/config'
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import ViteExpress from "vite-express";
import cors from 'cors'

import apiRouter from './Routers/api.js';
import authRouter from './Routers/auth.js';
import './db.js';

import Ip from './ip.js';
import './workers/sendAddress.js';

const app = express()
const port = Number(process.env.PORT || 3000)

// Socket.IO will be initialized after ViteExpress setup
let io: SocketIOServer;

// Make io available globally for other modules
declare global {
  var socketIO: SocketIOServer;
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
  process.exit(1);
}

if (!process.env.STEAM_GRID_ID_KEY) {
  console.error('STEAM_GRID_ID_KEY is not set in environment variables');
  console.info('\x1b[34mYou can get a key from https://www.steamgriddb.com/profile/preferences/api\x1b[0m');
  process.exit(1);
}

if (!process.env.STEAM_API_KEY) {
  console.error('STEAM_API_KEY is not set in environment variables');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  ViteExpress.config({
    inlineViteConfig: {
      build: { outDir: "public" }
    }
  });
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.get('/api/ip', (req, res) => {
  const ip = Ip(req, res);
  res.json({ ip });
});

// Initialize ViteExpress and get the server instance
const server = ViteExpress.listen(app, port, () => {
  console.log(`🚀 Server is listening on port ${port}...`);
  
  // Initialize Socket.IO with the ViteExpress server
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Make io available globally
  global.socketIO = io;
  
  console.log(`🔌 Socket.IO server initialized on port ${port}`);

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);
    
    // Join the game sessions room for real-time updates
    socket.join('game-sessions');
    console.log(`📡 Client ${socket.id} joined game-sessions room`);
    
    socket.on('disconnect', (reason) => {
      console.log('🔴 Client disconnected:', socket.id, 'reason:', reason);
    });
    
    socket.on('error', (error) => {
      console.error('❌ Socket error for client', socket.id, ':', error);
    });
  });
  
  io.on('error', (error) => {
    console.error('❌ Socket.IO server error:', error);
  });
});