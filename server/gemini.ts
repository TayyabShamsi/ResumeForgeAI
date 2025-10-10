import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeResume(resumeText: string, jobDescription: string) {
  const prompt = `You are a brutally honest resume expert and career coach. Analyze this resume against the job description and provide detailed, actionable feedback.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "score": <number 0-100>,
  "atsScore": <number 0-100>,
  "sectionsAnalyzed": <number>,
  "keywordsFound": <number>,
  "improvement": "<percentage like +25%>",
  "roasts": [
    {
      "type": "criticism" or "strength",
      "text": "<direct, honest feedback>",
      "explanation": "<detailed explanation with examples>"
    }
  ],
  "missingKeywords": ["<keyword1>", "<keyword2>"],
  "beforeAfter": [
    {
      "title": "<section name>",
      "before": "<weak version>",
      "after": "<improved version>"
    }
  ],
  "atsIssues": [
    {
      "type": "formatting" | "keywords" | "structure" | "content",
      "severity": "high" | "medium" | "low",
      "issue": "<specific problem>",
      "fix": "<how to fix it>"
    }
  ],
  "keywordDensity": {
    "total": <number>,
    "matched": <number>,
    "percentage": <number>
  }
}

Be brutally honest but constructive. Include at least 4-6 roasts (mix of criticisms and strengths), 5-7 missing keywords, 2-3 before/after examples, and 3-5 ATS-specific issues with fixes.`;

  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt
  });
  
  const responseText = result.text || "";
  
  // Clean up response to get only JSON
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid response format from AI");
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function generateInterviewQuestions(resumeText: string, jobDescription: string) {
  const prompt = `You are an expert interviewer. Based on this resume and job description, generate targeted interview questions.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Generate interview questions in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "behavioral": [
    {
      "question": "<question>",
      "category": "Behavioral",
      "reason": "<why they're asking this>",
      "sampleAnswer": "<strong sample answer>",
      "talkingPoints": ["<point1>", "<point2>", "<point3>", "<point4>"]
    }
  ],
  "technical": [<same structure>],
  "situational": [<same structure>],
  "curveball": [<same structure>]
}

Generate 2-3 questions for each category. Make them specific to the resume and role.`;

  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt
  });
  
  const responseText = result.text || "";
  
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid response format from AI");
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function optimizeLinkedIn(profileContent: string) {
  const prompt = `You are a LinkedIn optimization expert. Analyze this LinkedIn profile and provide optimization suggestions.

PROFILE CONTENT:
${profileContent}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "profileStrength": <number 0-100>,
  "headline": {
    "before": "<current or inferred headline>",
    "after": "<optimized headline>",
    "tips": ["<tip1>", "<tip2>"]
  },
  "about": {
    "before": "<current or inferred about section>",
    "after": "<optimized about section>",
    "tips": ["<tip1>", "<tip2>"]
  },
  "experience": {
    "before": "<current or inferred experience bullet>",
    "after": "<optimized experience bullet>",
    "tips": ["<tip1>", "<tip2>"]
  },
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "metrics": {
    "keywordDensity": <number>,
    "readability": <number 0-100>,
    "engagement": <number 0-100>
  }
}`;

  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt
  });
  
  const responseText = result.text || "";
  
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid response format from AI");
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function generateCoverLetter(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  tone: string
) {
  const toneGuidelines = {
    professional: "formal, polished, and traditional",
    enthusiastic: "energetic, passionate, and excited",
    formal: "very formal, conservative, and traditional business language",
    creative: "unique, personable, and showcasing personality"
  };

  const prompt = `Generate a ${toneGuidelines[tone as keyof typeof toneGuidelines]} cover letter based on:

RESUME:
${resumeText}

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}
JOB DESCRIPTION: ${jobDescription}

Write a compelling 3-4 paragraph cover letter that:
1. Opens with a strong hook
2. Highlights relevant achievements from the resume
3. Shows genuine interest in the role and company
4. Closes with a call to action

The tone should be ${tone}. Respond with ONLY the cover letter text, no JSON or formatting.`;

  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt
  });
  
  return result.text || "";
}

export async function chatWithAI(message: string, context: string) {
  const prompt = `You are an AI interview coach. Help the user prepare for their interview.

CONTEXT:
${context}

USER MESSAGE:
${message}

Provide helpful, practical advice. Be supportive but honest. Keep responses concise (2-3 paragraphs max).`;

  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt
  });
  
  return result.text || "";
}
