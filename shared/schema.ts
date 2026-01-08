
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
  session_data: jsonb("session_data").default({}), // Store temp data
  access_level: text("access_level").default("user"),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Prayer Requests (PETICIONES)
export const prayer_requests = pgTable("prayer_requests", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull(),
  user_name: text("user_name").notNull(),
  content: text("content").notNull(),
  status: text("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

// Ministries
export const ministries = pgTable("ministries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  whatsapp_link: text("whatsapp_link"),
});

// Leaders (Authorized leaders for envelope loading)
export const leaders = pgTable("leaders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ministry_id: integer("ministry_id").references(() => ministries.id),
  active: boolean("active").default(true),
});

// Envelope Loads (Carga de Sobres)
export const envelope_loads = pgTable("envelope_loads", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull(),
  user_name: text("user_name").notNull(),
  ministry_name: text("ministry_name"),
  mentor_name: text("mentor_name"),
  leader_name: text("leader_name"), // Column H match
  people_count: text("people_count"),
  is_new_person: text("is_new_person"),
  offering: text("offering"),
  photo_url: text("photo_url"),
  created_at: timestamp("created_at").defaultNow(),
});

// New People (NUEVOS DE ESPIGAS)
export const new_people = pgTable("new_people", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull(),
  recorded_by: text("recorded_by").notNull(),
  details: text("details").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Institute Enrollment (STAYING FOR DASHBOARD)
export const institute_enrollments = pgTable("institute_enrollments", {
  id: serial("id").primaryKey(),
  full_name: text("full_name").notNull(),
  main_year: text("main_year").notNull(),
  subjects: text("subjects").notNull(),
  paid_registration: text("paid_registration").notNull(),
  photo_registration: text("photo_registration"),
  photo_monthly: text("photo_monthly"),
  telegram_id: text("telegram_id").notNull(),
  user_name: text("user_name").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const institute_payments = pgTable("institute_payments", {
  id: serial("id").primaryKey(),
  full_name: text("full_name").notNull(),
  photo_monthly: text("photo_monthly").notNull(),
  telegram_id: text("telegram_id").notNull(),
  user_name: text("user_name").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertBotUserSchema = createInsertSchema(bot_users);
export const insertPrayerRequestSchema = createInsertSchema(prayer_requests);
export const insertMinistrySchema = createInsertSchema(ministries);
export const insertLeaderSchema = createInsertSchema(leaders);
export const insertEnvelopeLoadSchema = createInsertSchema(envelope_loads);
export const insertInstituteEnrollmentSchema = createInsertSchema(institute_enrollments);
export const insertInstitutePaymentSchema = createInsertSchema(institute_payments);
export const insertNewPeopleSchema = createInsertSchema(new_people);

// === TYPES ===
export type BotUser = typeof bot_users.$inferSelect;
export type PrayerRequest = typeof prayer_requests.$inferSelect;
export type Ministry = typeof ministries.$inferSelect;
export type Leader = typeof leaders.$inferSelect;
export type EnvelopeLoad = typeof envelope_loads.$inferSelect;
export type InstituteEnrollment = typeof institute_enrollments.$inferSelect;
export type InstitutePayment = typeof institute_payments.$inferSelect;
export type NewPerson = typeof new_people.$inferSelect;

export type InsertBotUser = z.infer<typeof insertBotUserSchema>;
export type InsertPrayerRequest = z.infer<typeof insertPrayerRequestSchema>;
export type InsertMinistry = z.infer<typeof insertMinistrySchema>;
export type InsertLeader = z.infer<typeof insertLeaderSchema>;
export type InsertEnvelopeLoad = z.infer<typeof insertEnvelopeLoadSchema>;
export type InsertInstituteEnrollment = z.infer<typeof insertInstituteEnrollmentSchema>;
export type InsertInstitutePayment = z.infer<typeof insertInstitutePaymentSchema>;
export type InsertNewPeople = z.infer<typeof insertNewPeopleSchema>;
