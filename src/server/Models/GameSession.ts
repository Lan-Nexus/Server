import Model from './Model.js';
import { gameSessionsTable } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db.js';

export default class GameSessionModel extends Model {
  static async create(gameSession: typeof gameSessionsTable.$inferInsert) {
    const newGameSession = await db.insert(gameSessionsTable).values(gameSession).$returningId();
    const item = await db.query.gameSessionsTable.findFirst({ 
      where: (gameSessionsTable, { eq }) => eq(gameSessionsTable.id, newGameSession[0].id) 
    });
    return item;
  }

  static async read(id: typeof gameSessionsTable.$inferSelect.id) {
    return db.query.gameSessionsTable.findFirst({ 
      where: (gameSessionsTable, { eq }) => eq(gameSessionsTable.id, id) 
    });
  }

  static async readById(id: number) {
    return db.select().from(gameSessionsTable).where(eq(gameSessionsTable.id, id)).then(rows => rows[0]);
  }

  static async update(id: typeof gameSessionsTable.$inferSelect.id, gameSession: Partial<typeof gameSessionsTable.$inferSelect>) {
    return db.update(gameSessionsTable).set(gameSession).where(eq(gameSessionsTable.id, id));
  }

  static async delete(id: typeof gameSessionsTable.$inferSelect.id) {
    await db.delete(gameSessionsTable).where(eq(gameSessionsTable.id, id));
  }

  static async startSession(clientId: string, gameId: number) {
    // End any existing active sessions for this client
    await this.endActiveSessionsForClient(clientId);
    
    const newSession = await this.create({
      clientId,
      gameId,
      startTime: new Date(),
      isActive: 1
    });
    
    return newSession;
  }

  static async endSession(sessionId: number) {
    return this.update(sessionId, {
      endTime: new Date(),
      isActive: 0
    });
  }

  static async endActiveSessionsForClient(clientId: string) {
    return db.update(gameSessionsTable)
      .set({ 
        endTime: new Date(),
        isActive: 0 
      })
      .where(and(
        eq(gameSessionsTable.clientId, clientId),
        eq(gameSessionsTable.isActive, 1)
      ));
  }

  static async getActiveSessionForClient(clientId: string) {
    return db.select()
      .from(gameSessionsTable)
      .where(and(
        eq(gameSessionsTable.clientId, clientId),
        eq(gameSessionsTable.isActive, 1)
      ))
      .then(rows => rows[0]);
  }

  static async getSessionsForClient(clientId: string) {
    return db.select()
      .from(gameSessionsTable)
      .where(eq(gameSessionsTable.clientId, clientId))
      .orderBy(desc(gameSessionsTable.startTime));
  }

  static async getSessionsForGame(gameId: number) {
    return db.select()
      .from(gameSessionsTable)
      .where(eq(gameSessionsTable.gameId, gameId))
      .orderBy(desc(gameSessionsTable.startTime));
  }

  static async getAllActiveSessions() {
    return db.select()
      .from(gameSessionsTable)
      .where(eq(gameSessionsTable.isActive, 1))
      .orderBy(desc(gameSessionsTable.startTime));
  }

  static async getAllSessions() {
    return db.select()
      .from(gameSessionsTable)
      .orderBy(desc(gameSessionsTable.startTime));
  }

  static async getSessionDuration(sessionId: number) {
    const session = await this.readById(sessionId);
    if (!session) return null;
    
    const startTime = new Date(session.startTime);
    const endTime = session.endTime ? new Date(session.endTime) : new Date();
    
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // Duration in seconds
  }
}