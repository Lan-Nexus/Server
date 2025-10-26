import { serial, mysqlTable, text, varchar, int, mediumtext, mysqlEnum, datetime } from "drizzle-orm/mysql-core";


export const status = ['Active', 'Draft'] as const;
export const statusTypeEnum = mysqlEnum('status', status);

import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

// Avatar type definition
export const avatarSchema = z.object({
  eyes: z.string(),
  eyebrows: z.string(),
  mouth: z.string(),
  glasses: z.string().optional(),
  earrings: z.string().optional(),
  hair: z.string(),
  hairColor: z.string(),
  skinColor: z.string(),
}).passthrough(); // Allow additional properties

export type Avatar = z.infer<typeof avatarSchema>;

export const usersTable = mysqlTable('users_table', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 100 }).notNull().default('user'),
  avatar: text('avatar'), // JSON string containing avatar configuration
});

export const gamesTable = mysqlTable("games", {
  id: serial().primaryKey(),
  gameID: varchar('game_id', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text().notNull(),
  icon: mediumtext('icon'),
  logo: mediumtext('logo'),
  headerImage: mediumtext('headerImage'),
  imageCard: mediumtext('imageCard'),
  heroImage: mediumtext('heroImage'),
  archives: varchar('archives', { length: 512 }), // Path to uploaded archive
  type: varchar('type', { length: 255 }).notNull(),
  install: mediumtext('install'), // Install script
  uninstall: mediumtext('uninstall'), // Uninstall script
  play: mediumtext('play'), // Play script
  needsKey: int('needs_key').notNull().default(0), // 0 = no key needed, 1 = key needed
  executable: mediumtext('executable'), // Path to the executable file
  status: statusTypeEnum.default('Draft').notNull(),
});

export const gameKeysTable = mysqlTable("game_keys", {
  id: serial().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  gameId: int("game_id").notNull(), // Foreign key to gamesTable.id
  ipAddress: varchar("ip_address", { length: 255 }).notNull(),
  clientId: varchar("client_id", { length: 255 })
});

export const gameEventsStatus = ['active', 'cancelled'] as const;
export const gameEventsStatusEnum = mysqlEnum('event_status', gameEventsStatus);

export const gameEventsTable = mysqlTable("game_events", {
  id: serial().primaryKey(),
  gameId: int("game_id").notNull(), // Foreign key to gamesTable.id
  gameName: varchar("game_name", { length: 255 }).notNull(),
  startTime: datetime("start_time").notNull(), // ISO string
  endTime: datetime("end_time").notNull(), // ISO string
  status: gameEventsStatusEnum.default('active').notNull(),
  description: text("description")
});


export const gamesSelectSchema = createSelectSchema(gamesTable);
export const gamesInsertSchema = createInsertSchema(gamesTable, {
  name: gamesSelectSchema.shape.name,
  archives: gamesSelectSchema.shape.archives.optional(),
  install: gamesSelectSchema.shape.install.optional(),
  uninstall: gamesSelectSchema.shape.uninstall.optional(),
  play: gamesSelectSchema.shape.play.optional(),
});
export const gamesUpdateSchema = createUpdateSchema(gamesTable, {
  ...gamesSelectSchema.shape,
  icon: gamesSelectSchema.shape.icon.optional(),
  logo: gamesSelectSchema.shape.logo.optional(),
  headerImage: gamesSelectSchema.shape.headerImage.optional(),
  imageCard: gamesSelectSchema.shape.imageCard.optional(),
  heroImage: gamesSelectSchema.shape.heroImage.optional(),
  archives: gamesSelectSchema.shape.archives.optional(),
  install: gamesSelectSchema.shape.install.optional(),
  uninstall: gamesSelectSchema.shape.uninstall.optional(),
  play: gamesSelectSchema.shape.play.optional(),
});

export const gameEventsSelectSchema = createSelectSchema(gameEventsTable);
export const gameEventsInsertSchema = createInsertSchema(gameEventsTable, {
  gameId: gameEventsSelectSchema.shape.gameId,
  gameName: gameEventsSelectSchema.shape.gameName,
  startTime: gameEventsSelectSchema.shape.startTime,
  endTime: gameEventsSelectSchema.shape.endTime,
  status: gameEventsSelectSchema.shape.status.optional(),
  description: gameEventsSelectSchema.shape.description.optional(),
});
export const gameEventsUpdateSchema = createUpdateSchema(gameEventsTable, {
  ...gameEventsSelectSchema.shape,
  gameId: gameEventsSelectSchema.shape.gameId.optional(),
  gameName: gameEventsSelectSchema.shape.gameName.optional(),
  startTime: gameEventsSelectSchema.shape.startTime.optional(),
  endTime: gameEventsSelectSchema.shape.endTime.optional(),
  status: gameEventsSelectSchema.shape.status.optional(),
  description: gameEventsSelectSchema.shape.description.optional(),
});

export const usersSelectSchema = createSelectSchema(usersTable);
export const usersInsertSchema = createInsertSchema(usersTable, {
  name: usersSelectSchema.shape.name,
  clientId: usersSelectSchema.shape.clientId,
  role: z.string().default('user').optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  avatar: z.union([
    z.string().transform((str, ctx) => {
      if (!str) return null;
      try {
        const parsed = JSON.parse(str);
        return avatarSchema.parse(parsed);
      } catch (e) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid avatar JSON" });
        return z.NEVER;
      }
    }),
    avatarSchema,
    z.null()
  ]).optional(),
});
export const usersUpdateSchema = createUpdateSchema(usersTable, {
  ...usersSelectSchema.shape,
  name: usersSelectSchema.shape.name.optional(),
  clientId: usersSelectSchema.shape.clientId.optional(),
  role: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  avatar: z.union([
    z.string().transform((str, ctx) => {
      if (!str) return null;
      try {
        const parsed = JSON.parse(str);
        return avatarSchema.parse(parsed);
      } catch (e) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid avatar JSON" });
        return z.NEVER;
      }
    }),
    avatarSchema,
    z.null()
  ]).optional(),
});
