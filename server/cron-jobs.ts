import cron from "node-cron";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Credit limits per tier
const CREDIT_LIMITS = {
  free: {
    resume: 5,
    interview: 2,
    linkedin: 1,
  },
  pro: {
    resume: 50,
    interview: 20,
    linkedin: 10,
  },
  premium: {
    resume: 999, // Effectively unlimited
    interview: 999,
    linkedin: 999,
  },
};

// Reset credits for all active subscribers
async function resetMonthlyCredits() {
  try {
    console.log("[CRON] Starting monthly credit reset...");

    // Get all users who should receive credit reset
    // Only reset for: active, trialing, and free tier users
    // Exclude: cancelled, past_due, or other inactive statuses
    const allUsers = await db.select().from(users);

    let resetCount = 0;
    const now = new Date();

    // Use transaction for atomicity
    await db.transaction(async (tx) => {
      for (const user of allUsers) {
        const status = user.subscriptionStatus || "free";
        const tier = user.subscriptionTier || "free";

        // Skip users with inactive subscriptions
        // Only reset for: active, trialing, or free tier users
        // Skip: canceled (Stripe spelling), past_due, incomplete, incomplete_expired, unpaid, paused
        const inactiveStatuses = ["canceled", "past_due", "incomplete", "incomplete_expired", "unpaid", "paused"];
        if (inactiveStatuses.includes(status)) {
          continue;
        }

        // Get credit limits for the tier
        const limits = CREDIT_LIMITS[tier as keyof typeof CREDIT_LIMITS] || CREDIT_LIMITS.free;

        // Reset remaining credits to the tier limit
        await tx.update(users)
          .set({
            creditsRemaining: {
              resume: limits.resume,
              interview: limits.interview,
              linkedin: limits.linkedin,
              coverLetter: limits.resume, // Cover letter uses same limit as resume
            },
            creditsResetDate: now,
          })
          .where(eq(users.id, user.id));

        resetCount++;
      }
    });

    console.log(`[CRON] Successfully reset credits for ${resetCount} users`);
  } catch (error) {
    console.error("[CRON] Error resetting monthly credits:", error);
  }
}

// Schedule credit reset to run on the 1st of every month at midnight
export function setupCronJobs() {
  // Run at midnight on the first day of every month
  // Format: "0 0 1 * *" = minute hour day month weekday
  cron.schedule("0 0 1 * *", resetMonthlyCredits, {
    timezone: "UTC",
  });

  console.log("[CRON] Monthly credit reset job scheduled for 1st of each month at midnight UTC");

  // For testing: run immediately if environment variable is set
  if (process.env.RUN_CREDIT_RESET_ON_STARTUP === "true") {
    console.log("[CRON] Running immediate credit reset (test mode)...");
    resetMonthlyCredits();
  }
}

// Export for manual testing
export { resetMonthlyCredits };
