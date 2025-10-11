import { Request, Response, NextFunction } from 'express';

/**
 * Redirects HTTP requests to HTTPS in production
 */
export function enforceHTTPS(req: Request, res: Response, next: NextFunction) {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    // Check if request is not secure
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      // Redirect to HTTPS version
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
  }
  next();
}

/**
 * Adds security headers to all responses
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Strict-Transport-Security: Force HTTPS for 1 year (production only)
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // X-Content-Type-Options: Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options: Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection: Enable browser XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content-Security-Policy: Different policies for development and production
  if (isProduction) {
    // Production: Strict CSP without unsafe-inline/unsafe-eval
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' https://js.stripe.com https://accounts.google.com; " +
      "style-src 'self' 'unsafe-inline'; " + // unsafe-inline needed for Tailwind
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://accounts.google.com; " +
      "frame-src https://js.stripe.com https://accounts.google.com; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );
  } else {
    // Development: More permissive CSP to allow Vite HMR
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' ws://localhost:* wss://localhost:* https://*.supabase.co https://api.stripe.com; " +
      "frame-src https://js.stripe.com; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );
  }

  // Referrer-Policy: Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: Control browser features
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  next();
}
