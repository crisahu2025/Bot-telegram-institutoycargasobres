
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { startBot } from "./bot";

async function seedDatabase() {
  const existing = await storage.getMinistries();
  if (existing.length === 0) {
    console.log("Seeding database...");
    const m1 = await storage.createMinistry({ name: "Horeb", whatsapp_link: "https://wa.me/123456789" });
    const m2 = await storage.createMinistry({ name: "Espigas", whatsapp_link: "https://wa.me/987654321" });
    const m3 = await storage.createMinistry({ name: "Alabanza" });

    await storage.createLeader({ name: "Juan Perez", ministry_id: m1.id, active: true });
    await storage.createLeader({ name: "Maria Gomez", ministry_id: m2.id, active: true });
    await storage.createLeader({ name: "Carlos Lopez", ministry_id: m3.id, active: true });
    console.log("Database seeded!");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Start the bot
  try {
      // Seed first
      await seedDatabase();
      startBot();
  } catch (e) {
      console.error("Failed to start bot:", e);
  }

  // === API ROUTES ===

  // Ministries
  app.get(api.ministries.list.path, async (req, res) => {
    const ministries = await storage.getMinistries();
    res.json(ministries);
  });

  app.post(api.ministries.create.path, async (req, res) => {
    try {
        const input = api.ministries.create.input.parse(req.body);
        const ministry = await storage.createMinistry(input);
        res.status(201).json(ministry);
    } catch (e) {
        res.status(400).json({ message: "Invalid input" });
    }
  });

  // Leaders
  app.get(api.leaders.list.path, async (req, res) => {
    const ministryId = req.query.ministry_id ? Number(req.query.ministry_id) : undefined;
    const leaders = await storage.getLeaders(ministryId);
    res.json(leaders);
  });

  app.post(api.leaders.create.path, async (req, res) => {
    try {
        const input = api.leaders.create.input.parse(req.body);
        const leader = await storage.createLeader(input);
        res.status(201).json(leader);
    } catch (e) {
        res.status(400).json({ message: "Invalid input" });
    }
  });

  // Requests
  app.get(api.requests.list.path, async (req, res) => {
    const requests = await storage.getRequests();
    res.json(requests);
  });

  // Envelopes
  app.get(api.envelopes.list.path, async (req, res) => {
    const envelopes = await storage.getEnvelopes();
    res.json(envelopes);
  });

  // New People
  app.get(api.newPeople.list.path, async (req, res) => {
    const people = await storage.getNewPeople();
    res.json(people);
  });

  return httpServer;
}
