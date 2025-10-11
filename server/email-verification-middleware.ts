import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Middleware to check if user has verified their email
 * Blocks access to AI features for unverified users
 */
export async function requireEmailVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user from database
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Email verification required",
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email address to access this feature. Check your inbox for the verification link."
      });
    }

    next();
  } catch (error: any) {
    console.error("Email verification check error:", error);
    res.status(500).json({ error: "Verification check failed" });
  }
}
