
import { db } from "./db";
import {
  ministries, leaders, prayer_requests, envelope_loads, new_people, bot_users,
  type Ministry, type Leader, type PrayerRequest, type EnvelopeLoad, type NewPerson, type BotUser,
  type InsertMinistry, type InsertLeader, type InsertEnvelopeLoad
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Ministries
  getMinistries(): Promise<Ministry[]>;
  getMinistry(id: number): Promise<Ministry | undefined>;
  getMinistryByName(name: string): Promise<Ministry | undefined>;
  createMinistry(ministry: InsertMinistry): Promise<Ministry>;

  // Leaders
  getLeaders(ministryId?: number): Promise<Leader[]>;
  createLeader(leader: InsertLeader): Promise<Leader>;
  getLeaderByName(name: string, ministryId: number): Promise<Leader | undefined>;

  // Requests
  getRequests(): Promise<PrayerRequest[]>;
  createRequest(req: { telegram_id: string; user_name: string; content: string }): Promise<PrayerRequest>;

  // Envelopes
  getEnvelopes(): Promise<EnvelopeLoad[]>;
  createEnvelope(env: InsertEnvelopeLoad): Promise<EnvelopeLoad>;

  // New People
  getNewPeople(): Promise<NewPerson[]>;
  createNewPerson(person: { telegram_id: string; recorded_by: string; details: string }): Promise<NewPerson>;

  // Bot Users (State)
  getBotUser(telegramId: string): Promise<BotUser | undefined>;
  updateBotUserStep(telegramId: string, step: string | null, data?: any): Promise<BotUser>;
  updateBotUserAccess(telegramId: string, access: string): Promise<BotUser>;
  createBotUser(user: { telegram_id: string; first_name?: string; last_name?: string; username?: string }): Promise<BotUser>;
}

export class DatabaseStorage implements IStorage {
  // Ministries
  async getMinistries(): Promise<Ministry[]> {
    return await db.select().from(ministries);
  }
  async getMinistry(id: number): Promise<Ministry | undefined> {
    const [m] = await db.select().from(ministries).where(eq(ministries.id, id));
    return m;
  }
  async getMinistryByName(name: string): Promise<Ministry | undefined> {
    const [m] = await db.select().from(ministries).where(eq(ministries.name, name));
    return m;
  }
  async createMinistry(ministry: InsertMinistry): Promise<Ministry> {
    const [m] = await db.insert(ministries).values(ministry).returning();
    return m;
  }

  // Leaders
  async getLeaders(ministryId?: number): Promise<Leader[]> {
    if (ministryId) {
      return await db.select().from(leaders).where(eq(leaders.ministry_id, ministryId));
    }
    return await db.select().from(leaders);
  }
  async createLeader(leader: InsertLeader): Promise<Leader> {
    const [l] = await db.insert(leaders).values(leader).returning();
    return l;
  }
  async getLeaderByName(name: string, ministryId: number): Promise<Leader | undefined> {
    // Simple case-insensitive match could be better, but exact for now as per generic implementation
    const allLeaders = await this.getLeaders(ministryId);
    return allLeaders.find(l => l.name.toLowerCase().trim() === name.toLowerCase().trim());
  }

  // Requests
  async getRequests(): Promise<PrayerRequest[]> {
    return await db.select().from(prayer_requests);
  }
  async createRequest(req: { telegram_id: string; user_name: string; content: string }): Promise<PrayerRequest> {
    const [r] = await db.insert(prayer_requests).values(req).returning();
    return r;
  }

  // Envelopes
  async getEnvelopes(): Promise<EnvelopeLoad[]> {
    return await db.select().from(envelope_loads);
  }
  async createEnvelope(env: InsertEnvelopeLoad): Promise<EnvelopeLoad> {
    const [e] = await db.insert(envelope_loads).values(env).returning();
    return e;
  }

  // New People
  async getNewPeople(): Promise<NewPerson[]> {
    return await db.select().from(new_people);
  }
  async createNewPerson(person: { telegram_id: string; recorded_by: string; details: string }): Promise<NewPerson> {
    const [p] = await db.insert(new_people).values(person).returning();
    return p;
  }

  // Bot Users
  async getBotUser(telegramId: string): Promise<BotUser | undefined> {
    const [u] = await db.select().from(bot_users).where(eq(bot_users.telegram_id, telegramId));
    return u;
  }
  async createBotUser(user: { telegram_id: string; first_name?: string; last_name?: string; username?: string }): Promise<BotUser> {
    const [u] = await db.insert(bot_users).values(user).returning();
    return u;
  }
  async updateBotUserStep(telegramId: string, step: string | null, data?: any): Promise<BotUser> {
    // First ensure user exists
    let user = await this.getBotUser(telegramId);
    if (!user) {
      user = await this.createBotUser({ telegram_id: telegramId });
    }
    
    const updateData: any = { step };
    if (data) {
      // Merge session data
      const currentData = (user.session_data as any) || {};
      updateData.session_data = { ...currentData, ...data };
    } else if (step === null) {
        // Clear session data on reset
        updateData.session_data = {};
    }

    const [updated] = await db.update(bot_users)
      .set(updateData)
      .where(eq(bot_users.telegram_id, telegramId))
      .returning();
    return updated;
  }
  async updateBotUserAccess(telegramId: string, access: string): Promise<BotUser> {
     const [updated] = await db.update(bot_users)
      .set({ access_level: access })
      .where(eq(bot_users.telegram_id, telegramId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
