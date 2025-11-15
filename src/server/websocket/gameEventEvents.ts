import { Server as SocketIOServer } from 'socket.io';

export interface GameEventEventData {
  id?: number;
  gameId: number;
  gameName: string;
  startTime: string | Date;
  endTime: string | Date;
  status: 'active' | 'cancelled';
  description?: string;
  gameIcon?: string;
  gameLogo?: string;
  gameImageCard?: string;
}

export class GameEventEvents {
  private static getIO(): SocketIOServer | null {
    return global.socketIO || null;
  }

  /**
   * Emit when a new game event is created
   */
  static eventCreated(eventData: GameEventEventData): void {
    const io = this.getIO();
    if (!io) {
      console.warn('🎯 [GameEventEvents] Socket.IO not available for eventCreated event');
      return;
    }

    console.log('🎯 [GameEventEvents] Emitting event_created event:', eventData.id);
    console.log('🎯 [GameEventEvents] Event data:', eventData);
    console.log('🎯 [GameEventEvents] Emitting to room: game-events');
    io.to('game-events').emit('event_created', eventData);
    console.log('🎯 [GameEventEvents] event_created emitted successfully');
  }

  /**
   * Emit when a game event is updated
   */
  static eventUpdated(eventData: GameEventEventData): void {
    const io = this.getIO();
    if (!io) {
      console.warn('🎯 [GameEventEvents] Socket.IO not available for eventUpdated event');
      return;
    }

    console.log('🎯 [GameEventEvents] Emitting event_updated event:', eventData.id);
    console.log('🎯 [GameEventEvents] Event data:', eventData);
    io.to('game-events').emit('event_updated', eventData);
    console.log('🎯 [GameEventEvents] event_updated emitted successfully');
  }

  /**
   * Emit when a game event is deleted
   */
  static eventDeleted(eventId: number): void {
    const io = this.getIO();
    if (!io) {
      console.warn('🎯 [GameEventEvents] Socket.IO not available for eventDeleted event');
      return;
    }

    console.log('🎯 [GameEventEvents] Emitting event_deleted event:', eventId);
    io.to('game-events').emit('event_deleted', { id: eventId });
    console.log('🎯 [GameEventEvents] event_deleted emitted successfully');
  }

  /**
   * Emit when a game event status is updated
   */
  static eventStatusUpdated(eventId: number, status: 'active' | 'cancelled'): void {
    const io = this.getIO();
    if (!io) {
      console.warn('🎯 [GameEventEvents] Socket.IO not available for eventStatusUpdated event');
      return;
    }

    console.log('🎯 [GameEventEvents] Emitting event_status_updated event:', eventId, status);
    io.to('game-events').emit('event_status_updated', { id: eventId, status });
    console.log('🎯 [GameEventEvents] event_status_updated emitted successfully');
  }

  /**
   * Emit the current list of all events
   */
  static eventsListUpdated(events: GameEventEventData[]): void {
    const io = this.getIO();
    if (!io) {
      console.warn('🎯 [GameEventEvents] Socket.IO not available for eventsListUpdated event');
      return;
    }

    console.log('🎯 [GameEventEvents] Emitting events_list_updated event:', events.length, 'events');
    console.log('🎯 [GameEventEvents] Events:', events.map(e => ({ id: e.id, gameName: e.gameName })));
    io.to('game-events').emit('events_list_updated', { events });
    console.log('🎯 [GameEventEvents] events_list_updated emitted successfully');
  }
}