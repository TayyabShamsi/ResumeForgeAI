# Email Verification Setup Guide

This guide explains how to configure email verification for ResumeForge AI using Supabase.

## ⚠️ CRITICAL CONFIGURATION

**You MUST configure these Supabase settings correctly** for authentication to work:

### Step 1: Enable Email Provider
1. Go to Supabase Dashboard → Authentication → Providers → Email
2. **ENABLE "Enable email provider"** toggle (if disabled)
3. This allows users to sign up and log in with email/password

### Step 2: Disable Email Confirmation
1. In the same Email provider settings
2. **DISABLE the "Confirm email" toggle**
3. This allows instant signup/login while still tracking email verification for AI feature access

**Common Symptoms if Misconfigured:**
- "Email signups are disabled" → Email provider is disabled (enable it)
- Signup succeeds but can't log in → "Confirm email" is enabled (disable it)
- "Invalid email or password" on login → "Confirm email" is enabled (disable it)

## Why Email Verification?

Email verification is a critical security measure that:
- Prevents fake account creation
- Ensures users own the email addresses they register with
- Protects against spam and abuse
- Required for accessing AI features

## Supabase Configuration

### Step 1: Configure Email Templates

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your ResumeForge AI project

2. **Navigate to Authentication Settings**
   - Go to "Authentication" → "Email Templates"
   - Find the "Confirm signup" template

3. **Customize Verification Email** (Optional)
   - Edit the email subject and body to match your branding
   - The default template works but you can customize:
     ```
     Subject: Verify your email for ResumeForge AI
     
     Hi there,
     
     Thank you for signing up for ResumeForge AI!
     
     Please verify your email address by clicking the link below:
     
     {{ .ConfirmationURL }}
     
     This link will expire in 24 hours.
     
     If you didn't create an account, you can safely ignore this email.
     
     Best regards,
     The ResumeForge AI Team
     ```

### Step 2: Configure Redirect URLs

1. **Set Site URL**
   - Go to "Authentication" → "URL Configuration"
   - Set "Site URL" to your application URL:
     ```
     https://<your-replit-app>.replit.app
     ```

2. **Configure Redirect URLs**
   - Add the following redirect URLs:
     ```
     https://<your-replit-app>.replit.app/auth/callback
     https://<your-replit-app>.replit.app/verify-email
     ```

### Step 3: Configure Email Verification

1. **Configure Email Provider**
   - Go to "Authentication" → "Providers" → "Email"
   - Ensure "Enable email provider" is checked
   - **DISABLE "Confirm email"** toggle
   - Important: Keep this disabled to allow users immediate app access
   - Email verification is enforced separately for AI features only

2. **Configure Email Settings**
   - Verification link expiry: 24 hours (default)
   - Rate limiting: Enabled (prevents spam)

## Application Integration

The application is already configured to:

1. **Signup Flow**
   - New users receive verification email automatically
   - Email verification status tracked in database
   - Users can resend verification email if needed

2. **Feature Access Control**
   - AI features (resume analysis, interview prep, etc.) require verified email
   - Unverified users see a banner with resend option
   - Google OAuth users are auto-verified

3. **Verification Process**
   - User clicks link in verification email
   - Supabase validates token and confirms email
   - Database updated with verification status
   - User can immediately access all features

## Testing Email Verification

### Development Testing

1. **Create a Test Account**
   - Sign up with a real email address you control
   - Check your inbox for verification email

2. **Click Verification Link**
   - Link format: `https://<your-app>.replit.app/verify-email?token=...`
   - Should redirect to dashboard with verified status

3. **Test Resend Functionality**
   - Sign up but don't verify
   - Log in and click "Resend Email" in banner
   - Verify you receive a new email

### Production Testing

1. **Test with Multiple Email Providers**
   - Gmail, Outlook, Yahoo, etc.
   - Verify emails don't go to spam
   - Check email rendering

2. **Test Edge Cases**
   - Expired verification links (after 24 hours)
   - Already verified users
   - Multiple resend attempts

## Troubleshooting

### Users cannot sign up or log in
**MOST COMMON ISSUE**: Supabase "Confirm email" is enabled
1. Symptom: Signup succeeds but user is not logged in, or login fails with "Invalid email or password"
2. Fix: Go to Supabase Dashboard → Authentication → Providers → Email → **DISABLE "Confirm email"**
3. Verify: After disabling, try creating a new account - should work immediately

### Verification emails not sending
1. Check Supabase email provider is enabled
2. Verify SMTP settings (if using custom email)
3. Check spam folder
4. Review Supabase logs: "Authentication" → "Logs"

### Verification link not working
1. Ensure redirect URLs are correctly configured
2. Check token hasn't expired (24 hour limit)
3. Verify application callback route exists

### Users stuck unverified
1. Check `emailVerified` field in database
2. Manually verify in Supabase: "Authentication" → "Users" → Select user → "Confirm email"
3. Check for email provider blocks

## Security Notes

- Verification emails contain one-time tokens
- Tokens expire after 24 hours for security
- Failed verification attempts are rate-limited
- Users can resend verification email (with rate limiting)
- Google OAuth users bypass email verification (Google pre-verifies)

## Custom Email Provider (Optional)

For better deliverability and branding, configure a custom SMTP provider:

1. **Choose a Provider**
   - SendGrid, Postmark, AWS SES, Mailgun

2. **Configure in Supabase**
   - Go to "Project Settings" → "Auth" → "SMTP Settings"
   - Enter your provider's SMTP credentials
   - Test email delivery

3. **Benefits**
   - Better deliverability rates
   - Custom from address (noreply@yourdomain.com)
   - Email analytics and tracking
   - Higher sending limits

## Next Steps

1. ✅ Configure email templates in Supabase
2. ✅ Enable email confirmation
3. ✅ Test verification flow
4. ✅ Configure custom SMTP (optional)
5. ✅ Monitor email delivery in production

For more details, see:
- [Supabase Email Auth Documentation](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
