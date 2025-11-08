import { Server as SocketIOServer } from 'socket.io';

export interface GameSessionEventData {
  id: number;
  clientId: string;
  gameId: number;
  startTime: string;
  endTime?: string;
  isActive: number;
  durationSeconds?: number;
  user?: {
    id: number;
    name: string;
    clientId: string;
    role: string;
    avatar: string | null;
  } | null;
}

export class GameSessionEvents {
  private static getIO(): SocketIOServer | null {
    return global.socketIO || null;
  }

  /**
   * Emit when a new game session is started
   */
  static sessionStarted(sessionData: GameSessionEventData): void {
    const io = this.getIO();
    if (!io) {
      console.warn('Socket.IO not available for sessionStarted event');
      return;
    }

    console.log('Emitting session_started event:', sessionData.id);
    io.to('game-sessions').emit('session_started', sessionData);
  }

  /**
   * Emit when a game session is stopped/ended
   */
  static sessionEnded(sessionData: GameSessionEventData): void {
    const io = this.getIO();
    if (!io) {
      console.warn('Socket.IO not available for sessionEnded event');
      return;
    }

    console.log('Emitting session_ended event:', sessionData.id);
    io.to('game-sessions').emit('session_ended', sessionData);
  }

  /**
   * Emit when a game session is updated
   */
  static sessionUpdated(sessionData: GameSessionEventData): void {
    const io = this.getIO();
    if (!io) {
      console.warn('Socket.IO not available for sessionUpdated event');
      return;
    }

    console.log('Emitting session_updated event:', sessionData.id);
    io.to('game-sessions').emit('session_updated', sessionData);
  }

  /**
   * Emit when a game session is deleted
   */
  static sessionDeleted(sessionId: number): void {
    const io = this.getIO();
    if (!io) {
      console.warn('Socket.IO not available for sessionDeleted event');
      return;
    }

    console.log('Emitting session_deleted event:', sessionId);
    io.to('game-sessions').emit('session_deleted', { id: sessionId });
  }

  /**
   * Emit when multiple sessions for a client are stopped
   */
  static clientSessionsStopped(clientId: string, sessionIds: number[]): void {
    const io = this.getIO();
    if (!io) {
      console.warn('Socket.IO not available for clientSessionsStopped event');
      return;
    }

    console.log('Emitting client_sessions_stopped event for client:', clientId);
    io.to('game-sessions').emit('client_sessions_stopped', { clientId, sessionIds });
  }

  /**
   * Emit the current list of all active sessions
   */
  static activeSessionsUpdated(activeSessions: GameSessionEventData[]): void {
    const io = this.getIO();
    if (!io) {
      console.warn('Socket.IO not available for activeSessionsUpdated event');
      return;
    }

    console.log('Emitting active_sessions_updated event:', activeSessions.length, 'sessions');
    io.to('game-sessions').emit('active_sessions_updated', { sessions: activeSessions });
  }
}
