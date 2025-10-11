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
import { db } from "./db";
import { subscriptionHistory } from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import { validateResumeFile, sanitizeFilename } from "./file-validator";
import { requireEmailVerification } from "./email-verification-middleware";

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
  // Skip the trust proxy validation since we've properly configured it in index.ts
  validate: { trustProxy: false },
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
        stripeCustomerId: dbUser.stripeCustomerId || null,
        currentPeriodEnd: dbUser.creditsResetDate || null,
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

  // Get user subscription history endpoint
  app.get("/api/subscription-history", authenticateSupabase, async (req, res) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Fetch subscription history from database
      const history = await db
        .select({
          id: subscriptionHistory.id,
          userId: subscriptionHistory.userId,
          previousTier: subscriptionHistory.fromTier,
          newTier: subscriptionHistory.toTier,
          changeType: subscriptionHistory.eventType,
          changedAt: subscriptionHistory.timestamp,
        })
        .from(subscriptionHistory)
        .where(eq(subscriptionHistory.userId, user.id))
        .orderBy(desc(subscriptionHistory.timestamp))
        .limit(20);
      
      res.json(history);
    } catch (error: any) {
      console.error("Error fetching subscription history:", error);
      res.status(500).json({ error: "Failed to fetch subscription history" });
    }
  });
  
  // Resume analysis endpoint (with credit check and email verification)
  app.post("/api/analyze-resume", authenticateSupabase, requireEmailVerification, checkResumeCredits, upload.single("resume"), async (req, res) => {
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
        const filename = req.file.originalname;

        // Validate file security
        const validation = validateResumeFile(buffer, mimeType, filename, {
          maxSize: 10 * 1024 * 1024, // 10MB
          strictValidation: true,
        });

        if (!validation.valid) {
          return res.status(400).json({ error: validation.error });
        }

        // Log any warnings
        if (validation.warnings && validation.warnings.length > 0) {
          console.warn('File validation warnings:', validation.warnings);
        }

        // Extract text from validated file with timeout protection
        const EXTRACTION_TIMEOUT = 10000; // 10 seconds max
        
        try {
          if (mimeType === "application/pdf") {
            const extractionPromise = (async () => {
              const pdfParse = (await import("pdf-parse")).default;
              const pdfData = await pdfParse(buffer);
              return pdfData.text;
            })();
            
            resumeText = await Promise.race([
              extractionPromise,
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('PDF extraction timeout')), EXTRACTION_TIMEOUT)
              )
            ]);
          } else if (
            mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            mimeType === "application/msword"
          ) {
            // DOCX: Add timeout protection against ZIP bombs
            const extractionPromise = mammoth.extractRawText({ buffer });
            
            const docData = await Promise.race([
              extractionPromise,
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('DOCX extraction timeout - file may be malicious')), EXTRACTION_TIMEOUT)
              )
            ]);
            
            resumeText = docData.value;
          } else {
            return res.status(400).json({ error: "Unsupported file format. Please use PDF or DOCX." });
          }
        } catch (extractionError: any) {
          if (extractionError.message?.includes('timeout')) {
            return res.status(400).json({ 
              error: 'File processing timeout. File may be corrupted or too complex.' 
            });
          }
          throw extractionError; // Re-throw other errors to be handled by outer try-catch
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

  // Resume rewrite endpoint (requires auth and email verification)
  app.post("/api/resume/rewrite", authenticateSupabase, requireEmailVerification, async (req, res) => {
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

  // Interview questions generation endpoint (with credit check and email verification)
  app.post("/api/generate-questions", authenticateSupabase, requireEmailVerification, checkInterviewCredits, async (req, res) => {
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

  // LinkedIn optimization endpoint (with credit check and email verification)
  app.post("/api/optimize-linkedin", authenticateSupabase, requireEmailVerification, checkLinkedInCredits, async (req, res) => {
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

  // Cover letter generation endpoint (with credit check and email verification)
  app.post("/api/generate-cover-letter", authenticateSupabase, requireEmailVerification, checkCoverLetterCredits, async (req, res) => {
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

  // AI chat endpoint for interview coaching (requires auth and email verification)
  app.post("/api/chat", authenticateSupabase, requireEmailVerification, async (req, res) => {
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
