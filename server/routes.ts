
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { startBot } from "./bot";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Start the bot
  try {
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
    try {
      const envelopes = await storage.getEnvelopes();
      res.json(envelopes);
    } catch (e) {
      console.error("Error fetching envelopes:", e);
      res.status(500).json({ message: "Error fetching envelopes" });
    }
  });

  // New People
  app.get(api.newPeople.list.path, async (req, res) => {
    const people = await storage.getNewPeople();
    res.json(people);
  });

  return httpServer;
}
