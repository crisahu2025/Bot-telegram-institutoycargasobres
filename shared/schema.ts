
import { pgTable, text, serial, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLES ===

// Store bot user state/session
export const bot_users = pgTable("bot_users", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull().unique(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  username: text("username"),
  step: text("step"), // Current state machine step
  session_data: jsonb("session_data").default({}), // Store temp data like 'selected_ministry'
  access_level: text("access_level").default("user"), // 'user', 'admin' (for 'Esteban2025' code)
  updated_at: timestamp("updated_at").defaultNow(),
});

// Prayer Requests
export const prayer_requests = pgTable("prayer_requests", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull(),
  user_name: text("user_name").notNull(),
  content: text("content").notNull(),
  status: text("status").default("pending"), // pending, reviewed
  created_at: timestamp("created_at").defaultNow(),
});

// Ministries (replacing Sheets)
export const ministries = pgTable("ministries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., "Horeb", "Espigas"
  whatsapp_link: text("whatsapp_link"),
});

// Leaders (replacing Sheets data)
export const leaders = pgTable("leaders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ministry_id: integer("ministry_id").references(() => ministries.id),
  active: boolean("active").default(true),
});

// Envelope Loads (Carga de Espiga)
export const envelope_loads = pgTable("envelope_loads", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull(),
  user_name: text("user_name").notNull(),
  ministry_name: text("ministry_name"),
  mentor_name: text("mentor_name"),
  leader_name: text("leader_name"),
  details: text("details"),
  created_at: timestamp("created_at").defaultNow(),
});

// New People (Nuevos)
export const new_people = pgTable("new_people", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull(),
  recorded_by: text("recorded_by").notNull(),
  details: text("details").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertBotUserSchema = createInsertSchema(bot_users);
export const insertPrayerRequestSchema = createInsertSchema(prayer_requests);
export const insertMinistrySchema = createInsertSchema(ministries);
export const insertLeaderSchema = createInsertSchema(leaders);
export const insertEnvelopeLoadSchema = createInsertSchema(envelope_loads);
export const insertNewPeopleSchema = createInsertSchema(new_people);

// === TYPES ===
export type BotUser = typeof bot_users.$inferSelect;
export type PrayerRequest = typeof prayer_requests.$inferSelect;
export type Ministry = typeof ministries.$inferSelect;
export type Leader = typeof leaders.$inferSelect;
export type EnvelopeLoad = typeof envelope_loads.$inferSelect;
export type NewPerson = typeof new_people.$inferSelect;
