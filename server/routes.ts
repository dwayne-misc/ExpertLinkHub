import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchExpertsFromSheet } from "./googleSheets";

const SPREADSHEET_ID = "1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg";

let expertsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

async function refreshExpertsCache() {
  const now = Date.now();
  if (now - expertsCacheTime > CACHE_DURATION) {
    try {
      const experts = await fetchExpertsFromSheet(SPREADSHEET_ID);
      storage.setExperts(experts);
      expertsCacheTime = now;
      console.log(`Fetched ${experts.length} experts from Google Sheets`);
    } catch (error) {
      console.error("Error fetching experts from Google Sheets:", error);
      if (expertsCacheTime === 0) {
        throw error;
      }
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/experts", async (req, res) => {
    try {
      await refreshExpertsCache();
      const experts = await storage.getExperts();
      res.json(experts);
    } catch (error) {
      console.error("Error getting experts:", error);
      res.status(500).json({ error: "Failed to fetch experts" });
    }
  });

  const httpServer = createServer(app);

  setInterval(refreshExpertsCache, CACHE_DURATION);

  return httpServer;
}
