import type { Express } from "express";
import { db } from "./db";
import { users } from "../shared/schema";
import { hashPassword, comparePassword, generateToken, authenticateUser } from "./auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export function registerAuthRoutes(app: Express) {
  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ error: "Password must contain at least 1 uppercase letter" });
      }
      if (!/\d/.test(password)) {
        return res.status(400).json({ error: "Password must contain at least 1 number" });
      }

      // Check if user exists
      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Calculate next month's 1st for credit reset
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
      nextMonth.setHours(0, 0, 0, 0);

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        passwordHash,
        name,
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        creditsRemaining: { resume: 5, interview: 2, linkedin: 1 },
        creditsResetDate: nextMonth,
        emailVerified: false,
      }).returning();

      // Generate token
      const token = generateToken(newUser);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax'
      });

      res.json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          subscriptionTier: newUser.subscriptionTier,
          creditsRemaining: newUser.creditsRemaining,
        }
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Compare password
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate token
      const token = generateToken(user);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          creditsRemaining: user.creditsRemaining,
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user (protected)
  app.get("/api/auth/me", authenticateUser, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        creditsRemaining: user.creditsRemaining,
        creditsResetDate: user.creditsResetDate,
        emailVerified: user.emailVerified,
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
  });

  // Password reset request
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: "If email exists, reset link has been sent" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await db.update(users)
        .set({
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        })
        .where(eq(users.id, user.id));

      // TODO: Send email with reset link
      // For now, just return success
      res.json({ message: "If email exists, reset link has been sent" });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      // Validate password
      if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
        return res.status(400).json({ error: "Password must be at least 8 characters with 1 uppercase and 1 number" });
      }

      // Find user with valid token
      const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
      
      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update password and clear reset token
      await db.update(users)
        .set({
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
        })
        .where(eq(users.id, user.id));

      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
}
