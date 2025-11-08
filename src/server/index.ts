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
import GameSessionModel from './Models/GameSession.js';
import UserModel from './Models/User.js';
import { GameSessionEvents } from './websocket/gameSessionEvents.js';

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
    
    // Handle game session events from clients
    socket.on('game_session_started', async (sessionData) => {
      console.log('🎮 Game session started:', sessionData);
      try {
        // Save session to database
        const newSession = await GameSessionModel.startSession(sessionData.clientId, sessionData.gameId);
        
        if (newSession) {
          // Fetch user information
          const user = await UserModel.findByClientId(newSession.clientId);
          
          const sessionEventData = {
            id: newSession.id,
            clientId: newSession.clientId,
            gameId: newSession.gameId,
            startTime: newSession.startTime.toISOString(),
            isActive: newSession.isActive,
            user: user ? {
              id: user.id,
              name: user.name,
              clientId: user.clientId,
              role: user.role,
              avatar: user.avatar
            } : null
          };
          
          // Broadcast to all clients using GameSessionEvents
          GameSessionEvents.sessionStarted(sessionEventData);
          
          // Update active sessions count with user data
          const activeSessions = await GameSessionModel.getAllActiveSessions();
          const activeSessionsWithUsers = await Promise.all(
            activeSessions.map(async (session) => {
              const sessionUser = await UserModel.findByClientId(session.clientId);
              return {
                id: session.id,
                clientId: session.clientId,
                gameId: session.gameId,
                startTime: session.startTime.toISOString(),
                endTime: session.endTime?.toISOString(),
                isActive: session.isActive,
                user: sessionUser ? {
                  id: sessionUser.id,
                  name: sessionUser.name,
                  clientId: sessionUser.clientId,
                  role: sessionUser.role,
                  avatar: sessionUser.avatar
                } : null
              };
            })
          );
          
          GameSessionEvents.activeSessionsCountUpdated(activeSessions.length);
          GameSessionEvents.activeSessionsUpdated(activeSessionsWithUsers);
        }
      } catch (error) {
        console.error('❌ Error starting game session:', error);
        socket.emit('session_error', { error: 'Failed to start session' });
      }
    });
    
    socket.on('game_session_ended', async (sessionData) => {
      console.log('🛑 Game session ended:', sessionData);
      try {
        // Find and end the active session for this client
        const activeSession = await GameSessionModel.getActiveSessionForClient(sessionData.clientId);
        
        if (activeSession) {
          await GameSessionModel.endSession(activeSession.id);
          
          const updatedSession = await GameSessionModel.readById(activeSession.id);
          if (updatedSession) {
            // Fetch user information
            const user = await UserModel.findByClientId(updatedSession.clientId);
            
            const sessionEventData = {
              id: updatedSession.id,
              clientId: updatedSession.clientId,
              gameId: updatedSession.gameId,
              startTime: updatedSession.startTime.toISOString(),
              endTime: updatedSession.endTime?.toISOString(),
              isActive: updatedSession.isActive,
              user: user ? {
                id: user.id,
                name: user.name,
                clientId: user.clientId,
                role: user.role,
                avatar: user.avatar
              } : null
            };
            
            // Broadcast to all clients
            GameSessionEvents.sessionEnded(sessionEventData);
            
            // Update active sessions count with user data
            const activeSessions = await GameSessionModel.getAllActiveSessions();
            const activeSessionsWithUsers = await Promise.all(
              activeSessions.map(async (session) => {
                const sessionUser = await UserModel.findByClientId(session.clientId);
                return {
                  id: session.id,
                  clientId: session.clientId,
                  gameId: session.gameId,
                  startTime: session.startTime.toISOString(),
                  endTime: session.endTime?.toISOString(),
                  isActive: session.isActive,
                  user: sessionUser ? {
                    id: sessionUser.id,
                    name: sessionUser.name,
                    clientId: sessionUser.clientId,
                    role: sessionUser.role,
                    avatar: sessionUser.avatar
                  } : null
                };
              })
            );
            
            GameSessionEvents.activeSessionsCountUpdated(activeSessions.length);
            GameSessionEvents.activeSessionsUpdated(activeSessionsWithUsers);
          }
        }
      } catch (error) {
        console.error('❌ Error ending game session:', error);
        socket.emit('session_error', { error: 'Failed to end session' });
      }
    });
    
    socket.on('join', async (room) => {
      if (room === 'game-sessions') {
        socket.join(room);
        console.log(`📡 Client ${socket.id} joined ${room} room`);
        
        // Send current active sessions to the new client
        try {
          const activeSessions = await GameSessionModel.getAllActiveSessions();
          const activeSessionsWithUsers = await Promise.all(
            activeSessions.map(async (session) => {
              const sessionUser = await UserModel.findByClientId(session.clientId);
              return {
                id: session.id,
                clientId: session.clientId,
                gameId: session.gameId,
                startTime: session.startTime.toISOString(),
                endTime: session.endTime?.toISOString(),
                isActive: session.isActive,
                user: sessionUser ? {
                  id: sessionUser.id,
                  name: sessionUser.name,
                  clientId: sessionUser.clientId,
                  role: sessionUser.role,
                  avatar: sessionUser.avatar
                } : null
              };
            })
          );
          
          socket.emit('active_sessions_updated', { sessions: activeSessionsWithUsers });
          console.log(`📤 Sent ${activeSessionsWithUsers.length} active sessions to new client`);
        } catch (error) {
          console.error('❌ Error sending active sessions to new client:', error);
        }
      }
    });

    // Handle manual request for active sessions
    socket.on('request_active_sessions', async () => {
      console.log('📡 Client requested active sessions');
      try {
        const activeSessions = await GameSessionModel.getAllActiveSessions();
        const activeSessionsWithUsers = await Promise.all(
          activeSessions.map(async (session) => {
            const sessionUser = await UserModel.findByClientId(session.clientId);
            return {
              id: session.id,
              clientId: session.clientId,
              gameId: session.gameId,
              startTime: session.startTime.toISOString(),
              endTime: session.endTime?.toISOString(),
              isActive: session.isActive,
              user: sessionUser ? {
                id: sessionUser.id,
                name: sessionUser.name,
                clientId: sessionUser.clientId,
                role: sessionUser.role,
                avatar: sessionUser.avatar
              } : null
            };
          })
        );
        
        socket.emit('active_sessions_updated', { sessions: activeSessionsWithUsers });
        console.log(`📤 Sent ${activeSessionsWithUsers.length} active sessions on request`);
      } catch (error) {
        console.error('❌ Error sending requested active sessions:', error);
        socket.emit('session_error', { error: 'Failed to get active sessions' });
      }
    });
    
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