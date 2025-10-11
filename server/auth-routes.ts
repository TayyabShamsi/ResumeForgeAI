import type { Express } from "express";
import { createClient } from '@supabase/supabase-js';
import { supabase } from "./supabase";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

// Supabase auth middleware with auto-refresh
export async function authenticateSupabase(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.sb_access_token;
  let refreshToken = req.cookies?.sb_refresh_token;

  if (!accessToken) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Create request-scoped Supabase client
  const requestClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Set session on request client
  await requestClient.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || ''
  });

  // Try to verify the current token
  let { data: { user }, error } = await requestClient.auth.getUser();

  // If token is expired and we have a refresh token, try to refresh
  if (error && refreshToken) {
    try {
      const { data: sessionData, error: refreshError } = await requestClient.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (!refreshError && sessionData.session && sessionData.user) {
        // Update cookies with new tokens
        res.cookie('sb_access_token', sessionData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 1000, // 1 hour
          sameSite: 'lax'
        });
        res.cookie('sb_refresh_token', sessionData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: 'lax'
        });

        // Update for this request
        accessToken = sessionData.session.access_token;
        user = sessionData.user;
        error = null;
        
        // Update request client with new session
        await requestClient.auth.setSession({
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token
        });
      }
    } catch (refreshError) {
      console.error("Auto-refresh failed:", refreshError);
    }
  }

  if (error || !user) {
    res.clearCookie('sb_access_token');
    res.clearCookie('sb_refresh_token');
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  // Sync email verification status from Supabase to our database
  if (user.email_confirmed_at) {
    try {
      // Check if our database needs to be updated
      const [dbUser] = await db.select({ emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      // If Supabase says verified but our DB says not verified, update our DB
      if (dbUser && !dbUser.emailVerified) {
        await db
          .update(users)
          .set({ emailVerified: true })
          .where(eq(users.id, user.id));
      }
    } catch (syncError) {
      console.error("Email verification sync error:", syncError);
      // Don't block the request if sync fails
    }
  }

  // Store request-scoped client, token and user for route handlers
  (req as any).supabaseClient = requestClient;
  (req as any).supabaseToken = accessToken;
  (req as any).user = {
    id: user.id,
    email: user.email,
    token: accessToken
  };
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

      // Set Supabase session cookies (both access and refresh tokens)
      if (authData.session) {
        res.cookie('sb_access_token', authData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 1000, // 1 hour
          sameSite: 'lax'
        });
        res.cookie('sb_refresh_token', authData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

      // Set Supabase session cookies (both access and refresh tokens)
      if (authData.session) {
        res.cookie('sb_access_token', authData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 1000, // 1 hour
          sameSite: 'lax'
        });
        res.cookie('sb_refresh_token', authData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
      const userId = (req as any).user.id;

      // Get user data from our database
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

  // Refresh token endpoint
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const refreshToken = req.cookies?.sb_refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token" });
      }

      // Refresh the session
      const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (refreshError || !sessionData.session) {
        res.clearCookie('sb_access_token');
        res.clearCookie('sb_refresh_token');
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      // Set new session cookies
      res.cookie('sb_access_token', sessionData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'lax'
      });
      res.cookie('sb_refresh_token', sessionData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax'
      });

      res.json({ 
        token: sessionData.session.access_token,
        message: "Token refreshed successfully" 
      });
    } catch (error: any) {
      console.error("Token refresh error:", error);
      res.status(500).json({ error: "Failed to refresh token" });
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
      res.clearCookie('sb_refresh_token');
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

      // Exchange recovery token for session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(token);

      if (sessionError || !sessionData.session) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      // Create a temporary client with the recovery session
      const tempClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Set the session with both access and refresh tokens
      await tempClient.auth.setSession({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token
      });

      // Update password using the authenticated session
      const { error: updateError } = await tempClient.auth.updateUser({
        password: password
      });

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      // Sign out the temporary session
      await tempClient.auth.signOut();

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

  // Resend verification email
  app.post("/api/auth/resend-verification", authenticateSupabase, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const userEmail = (req as any).user.email;

      // Get user from database to check verification status
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({ error: "Email already verified" });
      }

      // Resend verification email via Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) {
        console.error("Resend verification error:", error);
        return res.status(500).json({ error: "Failed to send verification email" });
      }

      res.json({ message: "Verification email sent. Please check your inbox." });
    } catch (error: any) {
      console.error("Resend verification error:", error);
      res.status(500).json({ error: "Failed to resend verification email" });
    }
  });

  // OAuth callback handler
  app.get("/api/auth/callback", async (req, res) => {
    try {
      const code = req.query.code as string;

      if (!code) {
        return res.redirect('/login?error=no_code');
      }

      // Exchange code for session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError || !sessionData.session || !sessionData.user) {
        console.error("OAuth session exchange error:", sessionError);
        return res.redirect('/login?error=auth_failed');
      }

      const supabaseUser = sessionData.user;

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

      // Set session cookies
      res.cookie('sb_access_token', sessionData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'lax'
      });
      res.cookie('sb_refresh_token', sessionData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax'
      });

      res.redirect('/dashboard');
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      res.redirect('/login?error=callback_failed');
    }
  });
}
