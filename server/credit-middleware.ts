import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function checkResumeCredits(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Pro and Premium have unlimited resume analyses
    if (user.subscriptionTier === 'pro' || user.subscriptionTier === 'premium') {
      return next();
    }

    // Free tier - check credits
    const credits = user.creditsRemaining as { resume: number; interview: number; linkedin: number };
    
    if (credits.resume <= 0) {
      return res.status(403).json({
        error: "No credits remaining",
        message: "You've used all 5 free resume analyses this month. Upgrade to Pro for unlimited access!",
        upgradeUrl: "/pricing",
        creditsResetDate: user.creditsResetDate,
        currentTier: user.subscriptionTier,
      });
    }

    // Deduct credit
    await db.update(users)
      .set({
        creditsRemaining: {
          ...credits,
          resume: credits.resume - 1,
        },
      })
      .where(eq(users.id, userId));

    next();
  } catch (error: any) {
    console.error("Credit check error:", error);
    res.status(500).json({ error: "Failed to check credits" });
  }
}

export async function checkInterviewCredits(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Pro and Premium have unlimited interview analyses
    if (user.subscriptionTier === 'pro' || user.subscriptionTier === 'premium') {
      return next();
    }

    // Free tier - check credits
    const credits = user.creditsRemaining as { resume: number; interview: number; linkedin: number };
    
    if (credits.interview <= 0) {
      return res.status(403).json({
        error: "No credits remaining",
        message: "You've used all 2 free interview question sets this month. Upgrade to Pro for unlimited access!",
        upgradeUrl: "/pricing",
        creditsResetDate: user.creditsResetDate,
        currentTier: user.subscriptionTier,
      });
    }

    // Deduct credit
    await db.update(users)
      .set({
        creditsRemaining: {
          ...credits,
          interview: credits.interview - 1,
        },
      })
      .where(eq(users.id, userId));

    next();
  } catch (error: any) {
    console.error("Credit check error:", error);
    res.status(500).json({ error: "Failed to check credits" });
  }
}

export async function checkLinkedInCredits(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Premium has unlimited LinkedIn scans
    if (user.subscriptionTier === 'premium') {
      return next();
    }

    const credits = user.creditsRemaining as { resume: number; interview: number; linkedin: number };

    // Pro tier - 10 LinkedIn scans per month
    if (user.subscriptionTier === 'pro') {
      if (credits.linkedin <= 0) {
        return res.status(403).json({
          error: "No credits remaining",
          message: "You've used all 10 LinkedIn scans this month. Upgrade to Premium for unlimited LinkedIn scans!",
          upgradeUrl: "/pricing",
          creditsResetDate: user.creditsResetDate,
          currentTier: user.subscriptionTier,
        });
      }

      // Deduct credit
      await db.update(users)
        .set({
          creditsRemaining: {
            ...credits,
            linkedin: credits.linkedin - 1,
          },
        })
        .where(eq(users.id, userId));

      return next();
    }

    // Free tier - 1 LinkedIn scan per month
    if (credits.linkedin <= 0) {
      return res.status(403).json({
        error: "No credits remaining",
        message: "You've used your free LinkedIn scan this month. Upgrade to Pro for 10 scans per month!",
        upgradeUrl: "/pricing",
        creditsResetDate: user.creditsResetDate,
        currentTier: user.subscriptionTier,
      });
    }

    // Deduct credit
    await db.update(users)
      .set({
        creditsRemaining: {
          ...credits,
          linkedin: credits.linkedin - 1,
        },
      })
      .where(eq(users.id, userId));

    next();
  } catch (error: any) {
    console.error("Credit check error:", error);
    res.status(500).json({ error: "Failed to check credits" });
  }
}

export async function checkCoverLetterCredits(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Pro and Premium have unlimited cover letters
    if (user.subscriptionTier === 'pro' || user.subscriptionTier === 'premium') {
      return next();
    }

    // Free tier doesn't have cover letter access
    return res.status(403).json({
      error: "Feature not available",
      message: "Cover letter generation is a Pro feature. Upgrade to unlock unlimited cover letters!",
      upgradeUrl: "/pricing",
      currentTier: user.subscriptionTier,
    });
  } catch (error: any) {
    console.error("Credit check error:", error);
    res.status(500).json({ error: "Failed to check credits" });
  }
}
