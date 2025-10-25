import { db } from "../db.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import Model from "./Model.js";

export default class UserModel extends Model {
  static async create(data: any) {
    const result = await db.insert(usersTable).values(data);
    return await this.read(result[0].insertId);
  }

  static async read(id: number) {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return result[0];
  }

  static async update(id: number, data: any) {
    await db.update(usersTable).set(data).where(eq(usersTable.id, id));
    return await this.read(id);
  }

  static async delete(id: number) {
    const result = await db.delete(usersTable).where(eq(usersTable.id, id));
    return result;
  }

  static async list() {
    return await db.select().from(usersTable);
  }

  static async findByClientId(clientId: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.clientId, clientId));
    return result[0];
  }

  static async updateByClientId(clientId: string, data: any) {
    await db.update(usersTable).set(data).where(eq(usersTable.clientId, clientId));
    return await this.findByClientId(clientId);
  }
}
