import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchExpertsFromSheet, fetchContentSectionsFromSheet, updateContentSheet, fetchExpertCategoriesFromSheet, appendExpertToSheet } from "./googleSheets";

const SPREADSHEET_ID = "1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg";

let expertsCacheTime = 0;
let contentCacheTime = 0;
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

async function refreshContentCache() {
  const now = Date.now();
  if (now - contentCacheTime > CACHE_DURATION) {
    try {
      const sections = await fetchContentSectionsFromSheet(SPREADSHEET_ID);
      storage.setContentSections(sections);
      contentCacheTime = now;
      console.log(`Fetched ${sections.length} content sections from Google Sheets`);
    } catch (error) {
      console.error("Error fetching content sections:", error);
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

  app.get("/api/content", async (req, res) => {
    try {
      await refreshContentCache();
      const sections = await storage.getContentSections();
      res.json(sections);
    } catch (error) {
      console.error("Error getting content sections:", error);
      res.status(500).json({ error: "Failed to fetch content sections" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await fetchExpertCategoriesFromSheet(SPREADSHEET_ID);
      res.json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/submit-expert", async (req, res) => {
    try {
      const { expertSubmissionSchema } = await import("@shared/schema");
      
      const validationResult = expertSubmissionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.errors 
        });
      }

      const { firstName, lastName, email, url, credentials, city, state, category, specialties } = validationResult.data;
      const { topLine } = req.body;

      if (!topLine) {
        return res.status(400).json({ error: "TopLine is required" });
      }

      await appendExpertToSheet(SPREADSHEET_ID, {
        firstName,
        lastName,
        email,
        url,
        credentials,
        city,
        state,
        category,
        specialties,
        topLine
      });

      expertsCacheTime = 0;
      await refreshExpertsCache();

      console.log(`Successfully added new expert: ${firstName} ${lastName} (${category})`);
      res.json({ success: true, message: "Expert submission successful" });
    } catch (error) {
      console.error("Error submitting expert:", error);
      res.status(500).json({ 
        error: "Failed to submit expert",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/content/setup-test-data", async (req, res) => {
    try {
      const testData = [
        ['Title', 'Content', 'Order', 'Type', 'ImageURL', 'SecondaryContent'],
        [
          'Welcome to Our Expert Directory',
          'This is a simple text block with a title and paragraph content. It\'s perfect for introductions, explanations, and general information. You can have multiple paragraphs by using line breaks in your Google Sheet cell.',
          '1',
          'text',
          '',
          ''
        ],
        [
          '',
          '',
          '2',
          'image',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop',
          ''
        ],
        [
          'Transform Your Business',
          'Connect with industry-leading experts who can help take your business to the next level.',
          '3',
          'hero',
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
          ''
        ],
        [
          'Our Approach',
          'We believe in connecting you with the right experts at the right time. Our curated network includes professionals across tax, legal, finance, and business consulting.\n\nEvery expert in our directory has been vetted for their expertise, experience, and commitment to client success.',
          '4',
          'two-column',
          '',
          'Our platform makes it easy to find and connect with specialists who understand your unique challenges.\n\nWhether you\'re navigating compliance, planning for growth, or preparing for a transaction, we have the experts you need.'
        ],
        [
          'Service Areas',
          'Tax & Accounting\nNavigate compliance and optimize your tax strategy\n\nLegal Services\nAccess expert counsel for transactions and governance\n\nFinancial Planning\nBuild comprehensive strategies for long-term success\n\nBusiness Consulting\nAlign operations with experienced advisors',
          '5',
          'cards',
          '',
          ''
        ],
        [
          'About Our Network',
          'Our expert directory connects you with seasoned professionals who have deep expertise in their respective fields. Each expert brings years of experience and a track record of helping businesses succeed.\n\nWe carefully curate our network to ensure you have access to top-tier talent when you need it most.',
          '6',
          'image-text',
          'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
          ''
        ],
        [
          'Why This Directory Exists',
          'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=600&h=400&fit=crop\nFind specialized guidance fast\nCut search time with curated internal and external experts categorized by what they do best.\n\nhttps://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop\nClarify exactly who does what\nEvery profile outlines specialties, credentials, and location so introductions happen with confidence.\n\nhttps://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop\nEnable smoother collaboration\nUse the directory as a shared map for cross-team projects, deal prep, or client referrals.',
          '7',
          'feature-cards',
          '',
          ''
        ]
      ];

      await updateContentSheet(SPREADSHEET_ID, testData);
      await refreshContentCache();
      
      res.json({ success: true, message: 'Test data added successfully' });
    } catch (error) {
      console.error("Error setting up test data:", error);
      res.status(500).json({ error: "Failed to setup test data" });
    }
  });

  const httpServer = createServer(app);

  setInterval(refreshExpertsCache, CACHE_DURATION);
  setInterval(refreshContentCache, CACHE_DURATION);

  return httpServer;
}
