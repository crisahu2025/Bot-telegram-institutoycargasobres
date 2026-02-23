import { getGoogleSheetsClient, SPREADSHEET_ID } from "./google-sheets";
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
  private async getClient() {
    return await getGoogleSheetsClient();
  }

  // --- BOT USERS (Stored in 'BOT_STATE' sheet) ---
  async getBotUser(telegramId: string): Promise<BotUser | undefined> {
    const sheets = await this.getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'BOT_STATE!A:G',
    });
    const rows = res.data.values || [];
    const index = rows.findIndex(r => r[1] === telegramId);
    if (index === -1) return undefined;
    const row = rows[index];
    return {
      id: index,
      telegram_id: row[1],
      first_name: row[2],
      last_name: row[3],
      username: row[4],
      step: row[5] || null,
      session_data: JSON.parse(row[6] || '{}'),
      access_level: row[7] || 'user',
      updated_at: new Date()
    };
  }

  async createBotUser(user: { telegram_id: string; first_name?: string; last_name?: string; username?: string }): Promise<BotUser> {
    const sheets = await this.getClient();
    const newUser = [
      '', // id placeholder
      user.telegram_id,
      user.first_name || '',
      user.last_name || '',
      user.username || '',
      '', // step
      '{}', // session_data
      'user' // access_level
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'BOT_STATE!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [newUser] },
    });
    return this.getBotUser(user.telegram_id) as Promise<BotUser>;
  }

  async updateBotUserStep(telegramId: string, step: string | null, data?: any): Promise<BotUser> {
    let user = await this.getBotUser(telegramId);
    if (!user) user = await this.createBotUser({ telegram_id: telegramId });

    const sheets = await this.getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'BOT_STATE!A:G',
    });
    const rows = res.data.values || [];
    const index = rows.findIndex(r => r[1] === telegramId);

    const sessionData = data ? { ...(user.session_data as any || {}), ...data } : (step === null ? {} : user.session_data);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `BOT_STATE!F${index + 1}:G${index + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[step || '', JSON.stringify(sessionData)]]
      }
    });

    return { ...user, step, session_data: sessionData };
  }

  async updateBotUserAccess(telegramId: string, access: string): Promise<BotUser> {
    const user = await this.getBotUser(telegramId);
    if (!user) throw new Error("User not found");
    const sheets = await this.getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'BOT_STATE!A:G',
    });
    const rows = res.data.values || [];
    const index = rows.findIndex(r => r[1] === telegramId);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `BOT_STATE!H${index + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[access]] }
    });
    return { ...user, access_level: access };
  }

  // --- MINISTRIES (Stored in the sheets list itself for names, or a summary sheet) ---
  async getMinistries(): Promise<Ministry[]> {
    const sheets = await this.getClient();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const excluded = ["PETICIONES", "NUEVOS DE ESPIGAS", "INSTITUTO DE AÑO", "INSTITUTO MATERIA VIRTUAL", "BOT_STATE", "ERROR_LOGS"];
    return (meta.data.sheets || [])
      .map(s => s.properties?.title || "")
      .filter(t => t && !excluded.includes(t))
      .map((name, i) => ({ id: i, name, whatsapp_link: "" }));
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
    const sheets = await this.getClient();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: ministry.name } } }]
      }
    });
    return { id: 0, ...ministry, whatsapp_link: "" };
  }

  async deleteMinistry(id: number): Promise<boolean> {
    const m = await this.getMinistry(id);
    if (!m) return false;
    const sheets = await this.getClient();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetId = meta.data.sheets?.find(s => s.properties?.title === m.name)?.properties?.sheetId;
    if (sheetId === undefined) return false;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ deleteSheet: { sheetId } }]
      }
    });
    return true;
  }

  // --- LEADERS (Stored in column H of each ministry sheet) ---
  async getLeaders(ministryId?: number): Promise<Leader[]> {
    const m = ministryId !== undefined ? await this.getMinistry(ministryId) : undefined;
    if (m) {
      const sheets = await this.getClient();
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${m.name}!H2:H100`,
      });
      return (res.data.values || []).map((v, i) => ({ id: i, name: v[0], ministry_id: m.id, active: true }));
    }
    return []; // For now, we only fetch per ministry
  }

  async createLeader(leader: InsertLeader): Promise<Leader> {
    const m = await this.getMinistry(leader.ministry_id!);
    if (!m) throw new Error("Ministry not found");
    const sheets = await this.getClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${m.name}!H2:H`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[leader.name]] }
    });
    return { id: 0, ...leader, active: true };
  }

  async updateLeader(id: number, data: Partial<InsertLeader>): Promise<Leader> {
    return { id, name: "", ministry_id: 0, active: true }; // Simplified for now
  }

  // --- REQUESTS (PETICIONES) ---
  async getRequests(): Promise<PrayerRequest[]> {
    const sheets = await this.getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'PETICIONES!A:C',
    });
    return (res.data.values || []).slice(1).map((r, i) => ({
      id: i,
      telegram_id: '',
      user_name: r[2] || '',
      content: r[0] || '',
      status: 'pending',
      created_at: new Date(r[1])
    }));
  }

  async createRequest(req: { telegram_id: string; user_name: string; content: string }): Promise<PrayerRequest> {
    const sheets = await this.getClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'PETICIONES!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[req.content, new Date().toLocaleString(), req.user_name]] }
    });
    return { id: 0, ...req, status: 'pending', created_at: new Date() };
  }

  // --- ENVELOPES (Ministry Sheets) ---
  async getEnvelopes(): Promise<EnvelopeLoad[]> {
    return []; // Detailed implementation would need to loop through all ministry sheets
  }

  async createEnvelope(env: InsertEnvelopeLoad): Promise<EnvelopeLoad> {
    const sheets = await this.getClient();
    const row = [
      env.mentor_name,
      env.leader_name,
      env.photo_url,
      '', // Ausencias/Motivo placeholder
      new Date().toLocaleString(),
      env.user_name,
      'NO', // Enviado
      '', '', '', '', '', // Padding to M
      env.people_count, // M
      env.offering // N
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${env.ministry_name}!A:N`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    });
    return { id: 0, ...env, created_at: new Date() };
  }

  // --- NEW PEOPLE (NUEVOS DE ESPIGAS) ---
  async getNewPeople(): Promise<NewPerson[]> {
    const sheets = await this.getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'NUEVOS DE ESPIGAS!A:C',
    });
    return (res.data.values || []).slice(1).map((r, i) => ({
      id: i,
      telegram_id: '',
      recorded_by: r[2] || '',
      details: r[0] || '',
      created_at: new Date(r[1])
    }));
  }

  async createNewPerson(person: { telegram_id: string; recorded_by: string; details: string }): Promise<NewPerson> {
    const sheets = await this.getClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'NUEVOS DE ESPIGAS!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[person.details, new Date().toLocaleString(), person.recorded_by]] }
    });
    return { id: 0, ...person, created_at: new Date() };
  }

  // --- INSTITUTE ---
  async createEnrollment(enrollment: InsertInstituteEnrollment): Promise<InstituteEnrollment> {
    const sheets = await this.getClient();
    const row = [
      enrollment.full_name,
      enrollment.main_year,
      enrollment.subjects,
      enrollment.paid_registration,
      enrollment.photo_registration || '',
      enrollment.photo_monthly || '',
      enrollment.telegram_id,
      enrollment.user_name,
      new Date().toLocaleString()
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'INSTITUTO DE AÑO!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    });
    return { id: 0, ...enrollment, created_at: new Date() };
  }

  async getEnrollments(): Promise<InstituteEnrollment[]> {
    const sheets = await this.getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'INSTITUTO DE AÑO!A:I',
    });
    return (res.data.values || []).slice(1).map((r, i) => ({
      id: i,
      full_name: r[0] || '',
      main_year: r[1] || '',
      subjects: r[2] || '',
      paid_registration: r[3] === 'true' || r[3] === 'SI',
      photo_registration: r[4] || '',
      photo_monthly: r[5] || '',
      telegram_id: r[6] || '',
      user_name: r[7] || '',
      created_at: new Date(r[8] || Date.now())
    }));
  }

  async getPayments(): Promise<InstitutePayment[]> {
    const sheets = await this.getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'INSTITUTO MATERIA VIRTUAL!A:E',
    });
    return (res.data.values || []).slice(1).map((r, i) => ({
      id: i,
      full_name: r[0] || '',
      photo_monthly: r[1] || '',
      telegram_id: r[2] || '',
      user_name: r[3] || '',
      created_at: new Date(r[4] || Date.now())
    }));
  }

  // --- ERROR LOGS ---
  async getErrorLogs(): Promise<ErrorLog[]> {
    return [];
  }
  async createErrorLog(log: InsertErrorLog): Promise<ErrorLog> {
    return { id: 0, ...log, created_at: new Date() };
  }
}

export const storage = new SheetsStorage();
