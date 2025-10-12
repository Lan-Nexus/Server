import Model from './Model.js';
import { gameEventsTable } from '../db/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../db.js';

export default class GameEventModel extends Model {
    static async create(gameEvent: typeof gameEventsTable.$inferInsert) {
        const newGameEvent = await db.insert(gameEventsTable).values(gameEvent).$returningId();
        const item = await db.query.gameEventsTable.findFirst({
            where: (gameEventsTable, { eq }) => eq(gameEventsTable.id, newGameEvent[0].id)
        });
        return item;
    }

    static async read(id: typeof gameEventsTable.$inferSelect.id) {
        return db.query.gameEventsTable.findFirst({
            where: (gameEventsTable, { eq }) => eq(gameEventsTable.id, id)
        });
    }

    static async list() {
        return db.select().from(gameEventsTable);
    }

    static async listByGame(gameId: number) {
        return db.select().from(gameEventsTable).where(eq(gameEventsTable.gameId, gameId));
    }

    static async listByDateRange(startDate: string, endDate: string) {
        return db.select().from(gameEventsTable).where(
            and(
                gte(gameEventsTable.startTime, startDate),
                lte(gameEventsTable.endTime, endDate)
            )
        );
    }

    static async listByStatus(status: 'upcoming' | 'active' | 'completed' | 'cancelled') {
        return db.select().from(gameEventsTable).where(eq(gameEventsTable.status, status));
    }

    static async update(id: typeof gameEventsTable.$inferSelect.id, gameEvent: Partial<typeof gameEventsTable.$inferSelect>) {
        return db.update(gameEventsTable).set(gameEvent).where(eq(gameEventsTable.id, id));
    }

    static async delete(id: typeof gameEventsTable.$inferSelect.id) {
        await db.delete(gameEventsTable).where(eq(gameEventsTable.id, id));
    }

    static async updateStatus(id: typeof gameEventsTable.$inferSelect.id, status: 'upcoming' | 'active' | 'completed' | 'cancelled') {
        return db.update(gameEventsTable).set({ status }).where(eq(gameEventsTable.id, id));
    }
}