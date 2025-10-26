import { db } from "../db.js";
import { usersTable, type Avatar } from "../db/schema.js";
import { eq } from "drizzle-orm";
import Model from "./Model.js";
import bcrypt from "bcryptjs";

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
    // Hash password if provided
    if (serializedData.password) {
      serializedData.password = bcrypt.hashSync(serializedData.password, 10);
    }
    const result = await db.insert(usersTable).values(serializedData);
    return await this.read(result[0].insertId);
  }

  static async read(id: number) {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return this.parseAvatar(result[0]);
  }

  static async update(id: number, data: any) {
    const serializedData = this.serializeAvatar(data);
    // Hash password if provided
    if (serializedData.password) {
      serializedData.password = bcrypt.hashSync(serializedData.password, 10);
    }
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

  // Method to verify password
  static verifyPassword(plainPassword: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  // Method to set password for existing user
  static async setPassword(id: number, password: string) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.update(usersTable).set({ password: hashedPassword }).where(eq(usersTable.id, id));
    return await this.read(id);
  }

  // Method to set password by client ID
  static async setPasswordByClientId(clientId: string, password: string) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.update(usersTable).set({ password: hashedPassword }).where(eq(usersTable.clientId, clientId));
    return await this.findByClientId(clientId);
  }

  // Method to authenticate user by clientId and password
  static async authenticate(clientId: string, password: string) {
    const user = await this.findByClientId(clientId);
    if (!user || !user.password) {
      return null;
    }

    const isValid = this.verifyPassword(password, user.password);
    if (isValid) {
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }

  static async findByClientId(clientId: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.clientId, clientId));
    return this.parseAvatar(result[0]);
  }

  static async updateByClientId(clientId: string, data: any) {
    const serializedData = this.serializeAvatar(data);
    // Hash password if provided
    if (serializedData.password) {
      serializedData.password = bcrypt.hashSync(serializedData.password, 10);
    }
    await db.update(usersTable).set(serializedData).where(eq(usersTable.clientId, clientId));
    return await this.findByClientId(clientId);
  }
}
