import { db } from "../db.js";
import { settingsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import Model from "./Model.js";

export default class SettingsModel extends Model {
  /**
   * Get a setting by key
   */
  static async get(key: string): Promise<string | null> {
    const result = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
    return result[0]?.value || null;
  }

  /**
   * Set a setting value (creates if doesn't exist, updates if exists)
   */
  static async set(key: string, value: string) {
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key));

    if (existing.length > 0) {
      // Update existing
      await db.update(settingsTable).set({ value }).where(eq(settingsTable.key, key));
    } else {
      // Create new
      await db.insert(settingsTable).values({ key, value });
    }

    return { key, value };
  }

  /**
   * Get all settings as key-value object
   */
  static async getAll(): Promise<Record<string, string>> {
    const results = await db.select().from(settingsTable);
    const settings: Record<string, string> = {};

    for (const row of results) {
      if (row.value) {
        settings[row.key] = row.value;
      }
    }

    return settings;
  }

  /**
   * Delete a setting by key
   */
  static async delete(key: string) {
    return await db.delete(settingsTable).where(eq(settingsTable.key, key));
  }

  /**
   * Get server name (helper method)
   */
  static async getServerName(): Promise<string> {
    const name = await this.get('server_name');
    return name || 'LAN Nexus Server';
  }

  /**
   * Set server name (helper method)
   */
  static async setServerName(name: string) {
    return await this.set('server_name', name);
  }
}
