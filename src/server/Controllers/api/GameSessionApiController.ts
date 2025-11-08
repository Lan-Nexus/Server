import { Request, Response } from 'express';
import GameSessionModel from '../../Models/GameSession.js';
import UserModel from '../../Models/User.js';
import { gameSessionsInsertSchema, gameSessionsUpdateSchema, gameSessionsSelectSchema } from '../../db/schema.js';
import { z } from 'zod';
import { PageController } from '../PageController.js';
import { GameSessionEvents, type GameSessionEventData } from '../../websocket/gameSessionEvents.js';

export default class GameSessionApiController extends PageController {
  constructor() {
    super(GameSessionModel, gameSessionsSelectSchema, gameSessionsInsertSchema, gameSessionsUpdateSchema);
  }

  // Helper function to convert database session to WebSocket event data
  private convertToEventData(session: any): GameSessionEventData {
    return {
      id: session.id,
      clientId: session.clientId,
      gameId: session.gameId,
      startTime: session.startTime instanceof Date ? session.startTime.toISOString() : session.startTime,
      endTime: session.endTime ? (session.endTime instanceof Date ? session.endTime.toISOString() : session.endTime) : undefined,
      isActive: session.isActive,
      durationSeconds: session.durationSeconds
    };
  }

  // Helper function to convert array of sessions
  private convertToEventDataArray(sessions: any[]): GameSessionEventData[] {
    return sessions.map(session => this.convertToEventData(session));
  }

  // Helper function to convert session to event data with user information
  private async convertToEventDataWithUser(session: any): Promise<GameSessionEventData> {
    const sessionUser = await UserModel.findByClientId(session.clientId);
    return {
      id: session.id,
      clientId: session.clientId,
      gameId: session.gameId,
      startTime: session.startTime instanceof Date ? session.startTime.toISOString() : session.startTime,
      endTime: session.endTime ? (session.endTime instanceof Date ? session.endTime.toISOString() : session.endTime) : undefined,
      isActive: session.isActive,
      durationSeconds: session.durationSeconds,
      user: sessionUser ? {
        id: sessionUser.id,
        name: sessionUser.name,
        clientId: sessionUser.clientId,
        role: sessionUser.role,
        avatar: sessionUser.avatar
      } : null
    };
  }

  // Helper function to convert array of sessions with user information
  private async convertToEventDataArrayWithUsers(sessions: any[]): Promise<GameSessionEventData[]> {
    return Promise.all(sessions.map(session => this.convertToEventDataWithUser(session)));
  }
  // Start a new game session
  async startSession(req: Request, res: Response) {
    try {
      const { clientId, gameId } = req.body;
      
      if (!clientId || !gameId) {
        return res.status(400).json({ 
          error: 'Missing required fields: clientId and gameId are required' 
        });
      }

      const session = await GameSessionModel.startSession(clientId, parseInt(gameId));
      
      // Emit WebSocket event for real-time updates
      if (session) {
        GameSessionEvents.sessionStarted(this.convertToEventData(session));
        
        // Update active sessions with user data
        const activeSessions = await GameSessionModel.getAllActiveSessions();
        const activeSessionsWithUsers = await this.convertToEventDataArrayWithUsers(activeSessions);
        GameSessionEvents.activeSessionsUpdated(activeSessionsWithUsers);
      }
      
      res.status(201).json({
        message: 'Game session started successfully',
        session
      });
    } catch (error) {
      console.error('Error starting game session:', error);
      res.status(500).json({ error: 'Failed to start game session' });
    }
  }

  // Stop a game session
  async stopSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ 
          error: 'Session ID is required' 
        });
      }

      // Get session data before ending for WebSocket event
      const session = await GameSessionModel.readById(parseInt(sessionId));
      
      await GameSessionModel.endSession(parseInt(sessionId));
      
      // Emit WebSocket event for real-time updates
      if (session) {
        GameSessionEvents.sessionEnded(this.convertToEventData({
          ...session,
          isActive: 0,
          endTime: new Date().toISOString()
        }));
      }
      
      // Update active sessions with user data
      const activeSessions = await GameSessionModel.getAllActiveSessions();
      const activeSessionsWithUsers = await this.convertToEventDataArrayWithUsers(activeSessions);
      GameSessionEvents.activeSessionsUpdated(activeSessionsWithUsers);
      
      res.json({
        message: 'Game session stopped successfully'
      });
    } catch (error) {
      console.error('Error stopping game session:', error);
      res.status(500).json({ error: 'Failed to stop game session' });
    }
  }

  // Stop active session for a specific client
  async stopClientSession(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      
      if (!clientId) {
        return res.status(400).json({ 
          error: 'Client ID is required' 
        });
      }

      // Get active sessions for client before ending for WebSocket event
      const activeSessionsForClient = await GameSessionModel.getActiveSessionsForClient(clientId);
      const sessionIds = activeSessionsForClient.map(s => s.id);
      
      await GameSessionModel.endActiveSessionsForClient(clientId);
      
      // Emit WebSocket event for real-time updates
      if (sessionIds.length > 0) {
        GameSessionEvents.clientSessionsStopped(clientId, sessionIds);
      }
      
      // Update active sessions with user data
      const activeSessions = await GameSessionModel.getAllActiveSessions();
      const activeSessionsWithUsers = await this.convertToEventDataArrayWithUsers(activeSessions);
      GameSessionEvents.activeSessionsUpdated(activeSessionsWithUsers);
      
      res.json({
        message: 'Active sessions stopped for client'
      });
    } catch (error) {
      console.error('Error stopping client sessions:', error);
      res.status(500).json({ error: 'Failed to stop client sessions' });
    }
  }

  // Get active session for a client
  async getActiveSession(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      
      if (!clientId) {
        return res.status(400).json({ 
          error: 'Client ID is required' 
        });
      }

      const session = await GameSessionModel.getActiveSessionForClient(clientId);
      
      if (!session) {
        return res.status(404).json({ 
          message: 'No active session found for client' 
        });
      }

      res.json({ session });
    } catch (error) {
      console.error('Error getting active session:', error);
      res.status(500).json({ error: 'Failed to get active session' });
    }
  }

  // Get all sessions for a client
  async getClientSessions(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      
      if (!clientId) {
        return res.status(400).json({ 
          error: 'Client ID is required' 
        });
      }

      const sessions = await GameSessionModel.getSessionsForClient(clientId);
      
      res.json({ sessions });
    } catch (error) {
      console.error('Error getting client sessions:', error);
      res.status(500).json({ error: 'Failed to get client sessions' });
    }
  }

  // Get all sessions for a game
  async getGameSessions(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      
      if (!gameId) {
        return res.status(400).json({ 
          error: 'Game ID is required' 
        });
      }

      const sessions = await GameSessionModel.getSessionsForGame(parseInt(gameId));
      
      res.json({ sessions });
    } catch (error) {
      console.error('Error getting game sessions:', error);
      res.status(500).json({ error: 'Failed to get game sessions' });
    }
  }

  // Get all active sessions
  async getAllActiveSessions(req: Request, res: Response) {
    try {
      const sessions = await GameSessionModel.getAllActiveSessions();
      
      res.json({ sessions });
    } catch (error) {
      console.error('Error getting active sessions:', error);
      res.status(500).json({ error: 'Failed to get active sessions' });
    }
  }

  // Get all sessions
  async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = await GameSessionModel.getAllSessions();
      
      res.json({ sessions });
    } catch (error) {
      console.error('Error getting all sessions:', error);
      res.status(500).json({ error: 'Failed to get all sessions' });
    }
  }

  // Get session details by ID
  async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ 
          error: 'Session ID is required' 
        });
      }

      const session = await GameSessionModel.readById(parseInt(sessionId));
      
      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found' 
        });
      }

      // Get session duration
      const duration = await GameSessionModel.getSessionDuration(parseInt(sessionId));

      res.json({ 
        session: {
          ...session,
          durationSeconds: duration
        }
      });
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  }

  // Create a new session (manual creation)
  async createSession(req: Request, res: Response) {
    try {
      // Robust preprocessing to handle empty endTime
      const processedBody = { ...req.body };
      
      // Handle all possible empty/invalid endTime values
      if (!processedBody.endTime || processedBody.endTime === "" || processedBody.endTime === "null") {
        console.log('Removing empty/null/undefined endTime field');
        delete processedBody.endTime;
      }
      
      // Also handle the case where endTime exists but is falsy
      if (processedBody.hasOwnProperty('endTime') && !processedBody.endTime) {
        delete processedBody.endTime;
      }
      
      const validatedData = gameSessionsInsertSchema.parse(processedBody);
      
      // Convert endTime string to Date if it exists and isn't already a Date
      const sessionData = {
        ...validatedData,
        endTime: validatedData.endTime instanceof Date ? validatedData.endTime : 
                 validatedData.endTime ? new Date(validatedData.endTime) : undefined
      };
      
      const session = await GameSessionModel.create(sessionData);
      
      // Emit WebSocket event for real-time updates
      if (session && session.isActive === 1) {
        GameSessionEvents.sessionStarted(this.convertToEventData(session));
        
        // Update active sessions with user data
        const activeSessions = await GameSessionModel.getAllActiveSessions();
        const activeSessionsWithUsers = await this.convertToEventDataArrayWithUsers(activeSessions);
        GameSessionEvents.activeSessionsUpdated(activeSessionsWithUsers);
      }
      
      res.status(201).json({
        message: 'Game session created successfully',
        session
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Zod validation error:', error.errors);
        console.error('Zod error details:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ 
          error: 'Invalid input data',
          details: error.errors 
        });
      }
      
      console.error('Error creating game session:', error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      res.status(500).json({ error: 'Failed to create game session' });
    }
  }

  // Override mapRequestBody to handle endTime preprocessing for all requests
  public mapRequestBody(body: any, req: Request, res: Response): any {
    const processedBody = { ...body };
  
    // Handle all possible empty/invalid endTime values
    if (!processedBody.endTime || processedBody.endTime === "" || processedBody.endTime === "null") {
      console.log('mapRequestBody: Removing empty/null/undefined endTime field');
      delete processedBody.endTime;
    }
  
    // Also handle the case where endTime exists but is falsy
    if (processedBody.hasOwnProperty('endTime') && !processedBody.endTime) {
      delete processedBody.endTime;
    }
  
    return processedBody;
  }

  // Update an existing session
  async updateSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ 
          error: 'Session ID is required' 
        });
      }

      // Preprocess the data to handle empty endTime
      const processedBody = { ...req.body };
      if (processedBody.endTime === "" || processedBody.endTime === null || processedBody.endTime === undefined) {
        delete processedBody.endTime;
      }

      const validatedData = gameSessionsUpdateSchema.parse(processedBody);
      
      // Convert string dates to Date objects
      const updateData = {
        ...validatedData,
        startTime: validatedData.startTime ? new Date(validatedData.startTime) : undefined,
        endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined
      };
      
      await GameSessionModel.update(parseInt(sessionId), updateData);
      
      // Get updated session for WebSocket event
      const updatedSession = await GameSessionModel.readById(parseInt(sessionId));
      
      // Emit WebSocket event for real-time updates
      if (updatedSession) {
        GameSessionEvents.sessionUpdated(this.convertToEventData(updatedSession));
        
        // Update active sessions with user data if the session's active status changed
        const activeSessions = await GameSessionModel.getAllActiveSessions();
        const activeSessionsWithUsers = await this.convertToEventDataArrayWithUsers(activeSessions);
        GameSessionEvents.activeSessionsUpdated(activeSessionsWithUsers);
      }
      
      res.json({
        message: 'Game session updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input data',
          details: error.errors 
        });
      }
      
      console.error('Error updating game session:', error);
      res.status(500).json({ error: 'Failed to update game session' });
    }
  }

  // Delete a session
  async deleteSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ 
          error: 'Session ID is required' 
        });
      }

      await GameSessionModel.delete(parseInt(sessionId));
      
      // Emit WebSocket event for real-time updates
      GameSessionEvents.sessionDeleted(parseInt(sessionId));
      
      // Update active sessions with user data
      const activeSessions = await GameSessionModel.getAllActiveSessions();
      const activeSessionsWithUsers = await this.convertToEventDataArrayWithUsers(activeSessions);
      GameSessionEvents.activeSessionsUpdated(activeSessionsWithUsers);
      
      res.json({
        message: 'Game session deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting game session:', error);
      res.status(500).json({ error: 'Failed to delete game session' });
    }
  }
}