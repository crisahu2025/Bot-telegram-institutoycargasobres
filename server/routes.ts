
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { startBot } from "./bot";
import { db } from "./db";
import { institute_enrollments, institute_payments } from "@shared/schema";

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

  app.delete(api.ministries.delete.path, async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    console.log(`Intentando borrar ministerio ID: ${id}`);

    if (password !== "Esteban2025") {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    try {
      const success = await storage.deleteMinistry(Number(id));
      if (success) {
        res.json({ message: "Ministerio eliminado correctamente" });
      } else {
        res.status(404).json({ message: "Ministerio no encontrado en la base de datos" });
      }
    } catch (e) {
      console.error("Error al borrar ministerio:", e);
      res.status(500).json({ message: "Error interno del servidor" });
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

  app.patch("/api/leaders/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const leader = await storage.updateLeader(Number(id), req.body);
      res.json(leader);
    } catch (e) {
      res.status(400).json({ message: "Error updating leader" });
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

  // Institute
  app.get(api.institute.enrollments.path, async (req, res) => {
    const enrollments = await db.select().from(institute_enrollments);
    res.json(enrollments);
  });

  app.get(api.institute.payments.path, async (req, res) => {
    const payments = await db.select().from(institute_payments);
    res.json(payments);
  });

  app.get(api.newPeople.list.path, async (req, res) => {
    const people = await storage.getNewPeople();
    res.json(people);
  });

  // Error Logs
  app.get(api.errorLogs.list.path, async (req, res) => {
    const logs = await storage.getErrorLogs();
    res.json(logs);
  });

  app.post(api.errorLogs.create.path, async (req, res) => {
    try {
      const log = await storage.createErrorLog(req.body);
      res.status(201).json(log);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  return httpServer;
}
