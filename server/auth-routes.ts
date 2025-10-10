import type { Express } from "express";
import { supabase } from "./supabase";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

// Supabase auth middleware
export function authenticateSupabase(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.sb_access_token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Store token for route handlers to use
  (req as any).supabaseToken = token;
  next();
}

export function registerAuthRoutes(app: Express) {
  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
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

      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ error: "Failed to create user" });
      }

      // Calculate next month's 1st for credit reset
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
      nextMonth.setHours(0, 0, 0, 0);

      // Create user record in our database
      const [newUser] = await db.insert(users).values({
        id: authData.user.id,
        email,
        name,
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        creditsRemaining: { resume: 5, interview: 2, linkedin: 1 },
        creditsResetDate: nextMonth,
        emailVerified: false,
      }).returning();

      // Set Supabase session cookie
      if (authData.session) {
        res.cookie('sb_access_token', authData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: 'lax'
        });
      }

      res.json({
        token: authData.session?.access_token,
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

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!authData.user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Get user data from our database
      const [user] = await db.select().from(users).where(eq(users.id, authData.user.id)).limit(1);
      
      if (!user) {
        return res.status(404).json({ error: "User profile not found" });
      }

      // Set Supabase session cookie
      if (authData.session) {
        res.cookie('sb_access_token', authData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: 'lax'
        });
      }

      res.json({
        token: authData.session?.access_token,
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
  app.get("/api/auth/me", authenticateSupabase, async (req, res) => {
    try {
      const token = (req as any).supabaseToken;
      
      // Get user from Supabase token
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
      
      if (error || !supabaseUser) {
        return res.status(401).json({ error: "Invalid session" });
      }

      // Get user data from our database
      const [user] = await db.select().from(users).where(eq(users.id, supabaseUser.id)).limit(1);
      
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
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const token = req.cookies?.sb_access_token;
      
      if (token) {
        await supabase.auth.signOut();
      }
      
      res.clearCookie('sb_access_token');
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Password reset request
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.headers.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
      }

      // Always return success to prevent email enumeration
      res.json({ message: "If email exists, reset link has been sent" });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Reset password (called from reset link)
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { password, token } = req.body;

      if (!password || !token) {
        return res.status(400).json({ error: "Password and token are required" });
      }

      // Validate password
      if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
        return res.status(400).json({ 
          error: "Password must be at least 8 characters with 1 uppercase and 1 number" 
        });
      }

      // Update password via Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Google OAuth
  app.get("/api/auth/google", async (req, res) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${req.headers.origin}/auth/callback`,
        }
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.redirect(data.url);
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      res.status(500).json({ error: "OAuth failed" });
    }
  });

  // OAuth callback handler
  app.get("/api/auth/callback", async (req, res) => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (!supabaseUser) {
        return res.redirect('/login?error=auth_failed');
      }

      // Check if user exists in our database
      const [existingUser] = await db.select().from(users).where(eq(users.id, supabaseUser.id)).limit(1);

      if (!existingUser) {
        // Create user record for OAuth user
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
        nextMonth.setHours(0, 0, 0, 0);

        await db.insert(users).values({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
          googleId: supabaseUser.user_metadata?.sub,
          profilePicture: supabaseUser.user_metadata?.avatar_url,
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          creditsRemaining: { resume: 5, interview: 2, linkedin: 1 },
          creditsResetDate: nextMonth,
          emailVerified: true,
        });
      }

      res.redirect('/dashboard');
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      res.redirect('/login?error=callback_failed');
    }
  });
}
