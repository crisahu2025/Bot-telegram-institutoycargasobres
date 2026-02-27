import { callBridge } from "./google-sheets";
import {
  type Ministry, type Leader, type PrayerRequest, type EnvelopeLoad, type NewPerson, type BotUser,
  type InstituteEnrollment, type InstitutePayment, type ErrorLog,
  type InsertMinistry, type InsertLeader, type InsertEnvelopeLoad, type InsertInstituteEnrollment, type InsertInstitutePayment, type InsertErrorLog
} from "@shared/schema";

export interface IStorage {
  getMinistries(): Promise<Ministry[]>;
  getMinistry(id: number): Promise<Ministry | undefined>;
  getMinistryByName(name: string): Promise<Ministry | undefined>;
  createMinistry(ministry: InsertMinistry): Promise<Ministry>;

  getLeaders(ministryId?: number): Promise<Leader[]>;
  createLeader(leader: InsertLeader): Promise<Leader>;

  getRequests(): Promise<PrayerRequest[]>;
  createRequest(req: { telegram_id: string; user_name: string; content: string }): Promise<PrayerRequest>;

  getEnvelopes(): Promise<EnvelopeLoad[]>;
  createEnvelope(env: InsertEnvelopeLoad): Promise<EnvelopeLoad>;

  getNewPeople(): Promise<NewPerson[]>;
  createNewPerson(person: { telegram_id: string; recorded_by: string; details: string }): Promise<NewPerson>;

  getBotUser(telegramId: string): Promise<BotUser | undefined>;
  updateBotUserStep(telegramId: string, step: string | null, data?: any): Promise<BotUser>;
  updateBotUserAccess(telegramId: string, access: string): Promise<BotUser>;
  createBotUser(user: { telegram_id: string; first_name?: string; last_name?: string; username?: string }): Promise<BotUser>;
  createEnrollment(enrollment: InsertInstituteEnrollment): Promise<InstituteEnrollment>;
  getEnrollments(): Promise<InstituteEnrollment[]>;
  createPayment(payment: InsertInstitutePayment): Promise<InstitutePayment>;
  getPayments(): Promise<InstitutePayment[]>;
  deleteMinistry(id: number): Promise<boolean>;
  updateLeader(id: number, data: Partial<InsertLeader>): Promise<Leader>;

  getErrorLogs(): Promise<ErrorLog[]>;
  createErrorLog(log: InsertErrorLog): Promise<ErrorLog>;
}

export class SheetsStorage implements IStorage {

  // --- BOT USERS ---
  async getBotUser(telegramId: string): Promise<BotUser | undefined> {
    const res = await callBridge("getBotUser", { telegramId });
    if (res.status === "ok" && res.data) {
      return { ...res.data, id: 0, updated_at: new Date() };
    }
    return undefined;
  }

  async createBotUser(user: { telegram_id: string; first_name?: string; last_name?: string; username?: string }): Promise<BotUser> {
    await callBridge("updateBotUser", { telegramId: user.telegram_id, update: user });
    return this.getBotUser(user.telegram_id) as Promise<BotUser>;
  }

  async updateBotUserStep(telegramId: string, step: string | null, data?: any): Promise<BotUser> {
    const user = await this.getBotUser(telegramId);
    const sessionData = data ? { ...(user?.session_data as any || {}), ...data } : (step === null ? {} : user?.session_data);

    await callBridge("updateBotUser", {
      telegramId,
      update: { step: step || "", session_data: sessionData }
    });

    return this.getBotUser(telegramId) as Promise<BotUser>;
  }

  async updateBotUserAccess(telegramId: string, access: string): Promise<BotUser> {
    await callBridge("updateBotUser", { telegramId, update: { access_level: access } });
    return this.getBotUser(telegramId) as Promise<BotUser>;
  }

  // --- MINISTRIES ---
  async getMinistries(): Promise<Ministry[]> {
    const res = await callBridge("getMinistries");
    return res.status === "ok" ? res.data : [];
  }

  async getMinistryByName(name: string): Promise<Ministry | undefined> {
    const list = await this.getMinistries();
    return list.find(m => m.name === name);
  }

  async getMinistry(id: number): Promise<Ministry | undefined> {
    const list = await this.getMinistries();
    return list.find(m => m.id === id);
  }

  async createMinistry(ministry: InsertMinistry): Promise<Ministry> {
    // For simplicity, we assume the sheet creation is handled at bridge or we use saveEnvelope logic
    return { id: 0, ...ministry, whatsapp_link: "" };
  }

  async deleteMinistry(id: number): Promise<boolean> {
    return false; // Not critical for bot flow
  }

  // --- LEADERS ---
  async getLeaders(ministryId?: number): Promise<Leader[]> {
    return []; // Handled by bridge logic per ministry sheet
  }

  async createLeader(leader: InsertLeader): Promise<Leader> {
    return { id: 0, ...leader, active: true };
  }

  async updateLeader(id: number, data: Partial<InsertLeader>): Promise<Leader> {
    return { id, name: "", ministry_id: 0, active: true };
  }

  // --- REQUESTS (PETICIONES) ---
  async getRequests(): Promise<PrayerRequest[]> {
    return []; // Handled via dashboard fetching if needed
  }

  async createRequest(req: { telegram_id: string; user_name: string; content: string }): Promise<PrayerRequest> {
    await callBridge("saveRequest", req);
    return { id: 0, ...req, status: 'pending', created_at: new Date() };
  }

  // --- ENVELOPES (Ministry Sheets) ---
  async getEnvelopes(): Promise<EnvelopeLoad[]> {
    return [];
  }

  async createEnvelope(env: InsertEnvelopeLoad): Promise<EnvelopeLoad> {
    await callBridge("saveEnvelope", env);
    return { id: 0, ...env, created_at: new Date() };
  }

  // --- NEW PEOPLE (NUEVOS DE ESPIGAS) ---
  async getNewPeople(): Promise<NewPerson[]> {
    return [];
  }

  async createNewPerson(person: { telegram_id: string; recorded_by: string; details: string }): Promise<NewPerson> {
    await callBridge("saveNewPerson", person);
    return { id: 0, ...person, created_at: new Date() };
  }

  // --- INSTITUTE ---
  async createEnrollment(enrollment: InsertInstituteEnrollment): Promise<InstituteEnrollment> {
    await callBridge("saveEnrollment", enrollment);
    return { id: 0, ...enrollment, photo_registration: enrollment.photo_registration ?? null, photo_monthly: enrollment.photo_monthly ?? null, created_at: new Date() };
  }

  async getEnrollments(): Promise<InstituteEnrollment[]> {
    const res = await callBridge("getEnrollments");
    return res.status === "ok" ? res.data : [];
  }

  async getPayments(): Promise<InstitutePayment[]> {
    const res = await callBridge("getPayments");
    return res.status === "ok" ? res.data : [];
  }

  async createPayment(payment: InsertInstitutePayment): Promise<InstitutePayment> {
    await callBridge("savePayment", payment);
    return { id: 0, ...payment, photo_monthly: payment.photo_monthly ?? null, created_at: new Date() };
  }

  // --- ERROR LOGS ---
  async getErrorLogs(): Promise<ErrorLog[]> {
    return [];
  }
  async createErrorLog(log: InsertErrorLog): Promise<ErrorLog> {
    return { id: 0, ...log, stack: log.stack ?? null, context: log.context ?? {}, created_at: new Date() };
  }
}

export const storage = new SheetsStorage();
