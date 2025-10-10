import { supabase } from "./supabase";
import type { Request, Response, NextFunction } from "express";

// Supabase auth middleware
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.sb_access_token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Store token for route handlers to use
  (req as any).supabaseToken = token;
  (req as any).user = { token }; // For backward compatibility with existing code
  next();
}

// Credit check middleware factory
export function checkCredits(creditType: 'resume' | 'interview' | 'linkedin') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = (req as any).supabaseToken;
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // For now, pass through - credit checking will be implemented in routes with database access
      next();
    } catch (error) {
      return res.status(500).json({ error: "Credit check failed" });
    }
  };
}
