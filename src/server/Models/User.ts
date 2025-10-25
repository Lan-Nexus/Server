import { db } from "../db.js";
import { usersTable, type Avatar } from "../db/schema.js";
import { eq } from "drizzle-orm";
import Model from "./Model.js";

export default class UserModel extends Model {
  // Helper method to serialize avatar object to JSON string
  private static serializeAvatar(data: any) {
    if (data.avatar !== undefined) {
      if (data.avatar === null) {
        return {
          ...data,
          avatar: null
        };
      }
      if (typeof data.avatar === 'object') {
        return {
          ...data,
          avatar: JSON.stringify(data.avatar)
        };
      }
      if (typeof data.avatar === 'string') {
        return data; // Already a string, keep as is
      }
    }
    return data;
  }

  // Helper method to parse avatar JSON string back to object
  private static parseAvatar(user: any) {
    if (user && user.avatar && typeof user.avatar === 'string') {
      try {
        return {
          ...user,
          avatar: JSON.parse(user.avatar)
        };
      } catch (e) {
        // If parsing fails, return null for avatar
        return {
          ...user,
          avatar: null
        };
      }
    }
    return user;
  }

  static async create(data: any) {
    const serializedData = this.serializeAvatar(data);
    const result = await db.insert(usersTable).values(serializedData);
    return await this.read(result[0].insertId);
  }

  static async read(id: number) {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return this.parseAvatar(result[0]);
  }

  static async update(id: number, data: any) {
    const serializedData = this.serializeAvatar(data);
    await db.update(usersTable).set(serializedData).where(eq(usersTable.id, id));
    return await this.read(id);
  }

  static async delete(id: number) {
    const result = await db.delete(usersTable).where(eq(usersTable.id, id));
    return result;
  }

  static async list() {
    const results = await db.select().from(usersTable);
    return results.map(user => this.parseAvatar(user));
  }

  static async findByClientId(clientId: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.clientId, clientId));
    return this.parseAvatar(result[0]);
  }

  static async updateByClientId(clientId: string, data: any) {
    const serializedData = this.serializeAvatar(data);
    await db.update(usersTable).set(serializedData).where(eq(usersTable.clientId, clientId));
    return await this.findByClientId(clientId);
  }
}
