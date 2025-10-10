import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, json, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'premium']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'past_due', 'trialing']);
export const eventTypeEnum = pgEnum('event_type', ['subscribed', 'cancelled', 'upgraded', 'downgraded', 'renewed']);

// Users table (authentication handled by Supabase)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Supabase user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  googleId: text("google_id"),
  profilePicture: text("profile_picture"),
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default('free'),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").notNull().default('active'),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  creditsRemaining: json("credits_remaining").$type<{ resume: number; interview: number; linkedin: number }>().default({ resume: 5, interview: 2, linkedin: 1 }),
  creditsResetDate: timestamp("credits_reset_date"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Subscription history table
export const subscriptionHistory = pgTable("subscription_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventType: eventTypeEnum("event_type").notNull(),
  fromTier: subscriptionTierEnum("from_tier"),
  toTier: subscriptionTierEnum("to_tier"),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }),
  stripeInvoiceId: text("stripe_invoice_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Resumes table
export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  filename: text("filename").notNull(),
  originalText: text("original_text").notNull(),
  analysisResults: json("analysis_results"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  googleId: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertSubscriptionHistorySchema = createInsertSchema(subscriptionHistory).omit({
  id: true,
  timestamp: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSubscriptionHistory = z.infer<typeof insertSubscriptionHistorySchema>;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
