import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import mammoth from "mammoth";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { 
  analyzeResume, 
  generateInterviewQuestions, 
  optimizeLinkedIn, 
  generateCoverLetter,
  chatWithAI,
  rewriteResume
} from "./gemini";
import { stripeRouter } from "./stripe-routes";
import { 
  checkResumeCredits, 
  checkInterviewCredits, 
  checkLinkedInCredits,
  checkCoverLetterCredits 
} from "./credit-middleware";
import { authenticateSupabase } from "./auth-routes";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Rate limiter: 10 requests per IP per hour
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per window
  message: { error: "Too many requests. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Simple in-memory cache with 5-minute TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Create a hash from string for cache key
function createHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function getCached(key: string): any | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache(key: string, data: any): void {
  responseCache.set(key, { data, timestamp: Date.now() });
}

// Clean up expired cache entries every minute
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(responseCache.entries());
  for (const [key, entry] of entries) {
    if (now - entry.timestamp > CACHE_TTL) {
      responseCache.delete(key);
    }
  }
}, 60 * 1000);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Apply rate limiting to all API routes except Stripe webhook
  app.use("/api/", (req, res, next) => {
    if (req.path === '/stripe/webhook') {
      return next(); // Skip rate limiting for webhooks
    }
    return apiLimiter(req, res, next);
  });

  // Register Stripe routes
  app.use("/api/stripe", stripeRouter);
  
  // Get user subscription info endpoint
  app.get("/api/subscription-info", authenticateSupabase, async (req, res) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Fetch user from database with subscription info
      const dbUser = await storage.getUser(user.id);
      
      if (!dbUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const credits = dbUser.creditsRemaining as any || { resume: 5, interview: 2, linkedin: 1, coverLetter: 1 };
      
      res.json({
        tier: dbUser.subscriptionTier || 'free',
        status: dbUser.subscriptionStatus || 'active',
        credits: {
          resume: credits.resume || 0,
          interview: credits.interview || 0,
          linkedin: credits.linkedin || 0,
          coverLetter: credits.coverLetter || 0,
        },
        resetDate: dbUser.creditsResetDate,
      });
    } catch (error: any) {
      console.error("Error fetching subscription info:", error);
      res.status(500).json({ error: "Failed to fetch subscription info" });
    }
  });
  
  // Resume analysis endpoint (with credit check)
  app.post("/api/analyze-resume", authenticateSupabase, checkResumeCredits, upload.single("resume"), async (req, res) => {
    try {
      let resumeText = "";
      const { jobDescription, resumeText: pastedText } = req.body;

      if (pastedText) {
        // User pasted text directly
        resumeText = pastedText;
      } else if (req.file) {
        // User uploaded a file
        const buffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        if (mimeType === "application/pdf") {
          const pdfParse = (await import("pdf-parse")).default;
          const pdfData = await pdfParse(buffer);
          resumeText = pdfData.text;
        } else if (
          mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          mimeType === "application/msword"
        ) {
          const docData = await mammoth.extractRawText({ buffer });
          resumeText = docData.value;
        } else {
          return res.status(400).json({ error: "Unsupported file format. Please use PDF or DOCX." });
        }
      } else {
        return res.status(400).json({ error: "No resume provided" });
      }

      if (!jobDescription) {
        return res.status(400).json({ error: "Job description is required" });
      }

      // Create unique cache key from full resume + job description using hash
      const cacheKey = `resume:${createHash(resumeText + jobDescription)}`;
      
      // Check cache first
      const cached = getCached(cacheKey);
      if (cached) {
        console.log("Returning cached resume analysis");
        return res.json(cached);
      }

      const analysis = await analyzeResume(resumeText, jobDescription);
      
      // Include the extracted resume text in the response
      const response = {
        ...analysis,
        resumeText // Send back the extracted text for frontend to cache
      };
      
      // Cache the response
      setCache(cacheKey, response);
      
      res.json(response);
    } catch (error: any) {
      console.error("Resume analysis error:", error);
      
      let errorMessage = "Failed to analyze resume. Please try again.";
      let statusCode = 500;
      
      if (error.message?.includes("API key")) {
        errorMessage = "AI service configuration error. Please contact support.";
        statusCode = 503;
      } else if (error.message?.includes("rate limit") || error.message?.includes("quota")) {
        errorMessage = "AI service is temporarily unavailable. Please try again in a few minutes.";
        statusCode = 429;
      } else if (error.message?.includes("parse") || error.message?.includes("extract")) {
        errorMessage = "Failed to parse resume file. Please ensure it's a valid PDF or DOCX.";
        statusCode = 400;
      }
      
      res.status(statusCode).json({ error: errorMessage });
    }
  });

  // Resume rewrite endpoint
  app.post("/api/resume/rewrite", async (req, res) => {
    try {
      const { resumeText, jobDescription, analysisResults } = req.body;

      if (!resumeText) {
        return res.status(400).json({ error: "Resume text is required" });
      }

      // Validate resume length
      if (resumeText.length < 100) {
        return res.status(400).json({ 
          error: "Resume seems incomplete. Please upload a full resume." 
        });
      }

      if (resumeText.length > 10000) {
        return res.status(400).json({ 
          error: "Resume is quite long. Consider shortening before rewriting." 
        });
      }

      const rewrite = await rewriteResume(
        resumeText,
        jobDescription || "",
        analysisResults || {}
      );
      
      res.json(rewrite);
    } catch (error: any) {
      console.error("Resume rewrite error:", error);
      
      let errorMessage = "Couldn't generate revision right now. Please try again.";
      if (error.message?.includes("rate limit") || error.message?.includes("quota")) {
        errorMessage = "AI service is temporarily busy. Please try again in a moment.";
      }
      
      res.status(500).json({ error: errorMessage });
    }
  });

  // Interview questions generation endpoint (with credit check)
  app.post("/api/generate-questions", authenticateSupabase, checkInterviewCredits, async (req, res) => {
    try {
      const { resumeText, jobDescription } = req.body;

      if (!resumeText || !jobDescription) {
        return res.status(400).json({ error: "Resume text and job description are required" });
      }

      const questions = await generateInterviewQuestions(resumeText, jobDescription);
      
      res.json(questions);
    } catch (error: any) {
      console.error("Question generation error:", error);
      
      let errorMessage = "Failed to generate interview questions. Please try again.";
      if (error.message?.includes("rate limit") || error.message?.includes("quota")) {
        errorMessage = "AI service is temporarily busy. Please try again in a moment.";
      }
      
      res.status(500).json({ error: errorMessage });
    }
  });

  // LinkedIn optimization endpoint (with credit check)
  app.post("/api/optimize-linkedin", authenticateSupabase, checkLinkedInCredits, async (req, res) => {
    try {
      const { profileUrl, profileContent } = req.body;

      if (!profileContent && !profileUrl) {
        return res.status(400).json({ error: "Profile URL or content is required" });
      }

      let content = profileContent;

      // If URL provided and no content, scrape with ScrapingDog API
      if (profileUrl && !profileContent) {
        try {
          const scrapingDogKey = process.env.SCRAPINGDOG_API_KEY;
          if (!scrapingDogKey) {
            return res.status(400).json({ 
              error: "ScrapingDog API key not configured. Please paste profile content instead." 
            });
          }

          const scrapingUrl = `https://api.scrapingdog.com/linkedin/profile?api_key=${scrapingDogKey}&url=${encodeURIComponent(profileUrl)}`;
          
          const scrapingResponse = await fetch(scrapingUrl);
          const scrapingData = await scrapingResponse.json();

          if (!scrapingResponse.ok) {
            throw new Error(scrapingData.error || "Failed to scrape LinkedIn profile");
          }

          // Extract relevant profile data
          const profile = scrapingData;
          content = `
Headline: ${profile.headline || "Not found"}

About: ${profile.about || "Not found"}

Experience: ${profile.experience?.map((exp: any) => 
  `${exp.title} at ${exp.company} (${exp.duration}): ${exp.description || ""}`
).join("\n\n") || "Not found"}

Skills: ${profile.skills?.join(", ") || "Not found"}

Education: ${profile.education?.map((edu: any) => 
  `${edu.degree} from ${edu.school}`
).join(", ") || "Not found"}
          `.trim();

        } catch (scrapingError: any) {
          console.error("LinkedIn scraping error:", scrapingError);
          return res.status(400).json({ 
            error: "Failed to scrape LinkedIn URL. Please paste your profile content instead." 
          });
        }
      }
      
      const optimization = await optimizeLinkedIn(content);
      
      res.json(optimization);
    } catch (error: any) {
      console.error("LinkedIn optimization error:", error);
      res.status(500).json({ error: error.message || "Failed to optimize LinkedIn profile" });
    }
  });

  // Cover letter generation endpoint (with credit check)
  app.post("/api/generate-cover-letter", authenticateSupabase, checkCoverLetterCredits, async (req, res) => {
    try {
      const { resumeText, jobTitle, companyName, jobDescription, tone } = req.body;

      if (!resumeText || !jobTitle || !companyName) {
        return res.status(400).json({ 
          error: "Resume text, job title, and company name are required" 
        });
      }

      const coverLetter = await generateCoverLetter(
        resumeText,
        jobTitle,
        companyName,
        jobDescription || "",
        tone || "professional"
      );
      
      res.json({ coverLetter });
    } catch (error: any) {
      console.error("Cover letter generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate cover letter" });
    }
  });

  // AI chat endpoint for interview coaching
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await chatWithAI(message, context || "");
      
      res.json({ response });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
