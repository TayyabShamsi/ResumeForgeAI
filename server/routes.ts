import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import mammoth from "mammoth";
import rateLimit from "express-rate-limit";
import { 
  analyzeResume, 
  generateInterviewQuestions, 
  optimizeLinkedIn, 
  generateCoverLetter,
  chatWithAI 
} from "./gemini";

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

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Apply rate limiting to all API routes
  app.use("/api/", apiLimiter);
  
  // Resume analysis endpoint
  app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
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

      const analysis = await analyzeResume(resumeText, jobDescription);
      
      // Include the extracted resume text in the response
      res.json({
        ...analysis,
        resumeText // Send back the extracted text for frontend to cache
      });
    } catch (error: any) {
      console.error("Resume analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze resume" });
    }
  });

  // Interview questions generation endpoint
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const { resumeText, jobDescription } = req.body;

      if (!resumeText || !jobDescription) {
        return res.status(400).json({ error: "Resume text and job description are required" });
      }

      const questions = await generateInterviewQuestions(resumeText, jobDescription);
      
      res.json(questions);
    } catch (error: any) {
      console.error("Question generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate questions" });
    }
  });

  // LinkedIn optimization endpoint
  app.post("/api/optimize-linkedin", async (req, res) => {
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

  // Cover letter generation endpoint
  app.post("/api/generate-cover-letter", async (req, res) => {
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
