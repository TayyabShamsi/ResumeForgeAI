# Google OAuth Setup Guide

This guide explains how to enable Google Sign-In for ResumeForge AI.

## Prerequisites

- A Google Cloud Platform account
- Access to your Supabase project dashboard
- Your Replit deployment URL

## Step 1: Create Google Cloud OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in the required information:
     - App name: `ResumeForge AI`
     - User support email: Your email
     - Developer contact: Your email
   - **Add Authorized domains** (IMPORTANT - both required):
     - Add your Replit domain: `<your-app-name>.replit.app` (without https://)
     - Add your Supabase domain: `<your-project-id>.supabase.co` (without https://)
   - Click "Add or Remove Scopes" and add:
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `openid`
   - These scopes should appear selected - Save and continue
   - Add test users (if in Testing mode), or publish the app for production
   - Save and continue

3. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: `ResumeForge AI - Production`
   - Authorized JavaScript origins:
     ```
     https://<your-replit-app>.replit.app
     ```
   - Authorized redirect URIs:
     ```
     https://<your-supabase-project>.supabase.co/auth/v1/callback
     ```
   - Click "Create"
   - **Save the Client ID and Client Secret** (you'll need these for Supabase)

## Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your ResumeForge AI project

2. **Configure Google Provider**
   - Navigate to "Authentication" → "Providers"
   - Find "Google" in the list
   - Enable the Google provider
   - Enter your Google OAuth credentials:
     - **Client ID**: Paste from Google Cloud Console
     - **Client Secret**: Paste from Google Cloud Console
   - Save changes

3. **Configure Redirect URLs**
   - Go to "Authentication" → "URL Configuration"
   - Add your site URL:
     ```
     https://<your-replit-app>.replit.app
     ```
   - Add redirect URLs:
     ```
     https://<your-replit-app>.replit.app/auth/callback
     ```

## Step 3: Test Google OAuth

1. **Deploy your application** to Replit
2. **Visit your application** at `https://<your-replit-app>.replit.app`
3. Click **"Sign in with Google"** button
4. Verify you can:
   - Sign in with Google
   - See your account information
   - Access protected features

## Security Notes

- Google OAuth credentials are **production secrets** - never commit them to your repository
- The Client Secret is stored securely in Supabase - you don't need to add it to Replit
- Users will see a Google consent screen the first time they sign in
- Refresh tokens are valid for 7 days and automatically rotated

## Troubleshooting

### "Redirect URI mismatch" error
- Verify the redirect URI in Google Cloud Console exactly matches:
  ```
  https://<your-supabase-project>.supabase.co/auth/v1/callback
  ```
- Check for trailing slashes or http vs https

### "Access blocked" error
- Ensure the OAuth consent screen is configured and published
- Verify both Authorized domains are added (Replit and Supabase domains)
- Add test users if using "Testing" mode, or publish the app for production

### Users can't sign in
- Check Supabase logs in "Authentication" → "Logs"
- Verify the Client ID and Secret are correct
- Ensure your app URL is added to Supabase redirect URLs

## Additional Resources

- [Supabase Google OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
