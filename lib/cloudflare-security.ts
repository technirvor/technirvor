/**
 * Cloudflare Security Configuration for Tech Nirvor
 * Comprehensive security measures optimized for Cloudflare's edge network
 */

import { NextRequest, NextResponse } from 'next/server';

// Cloudflare-specific headers and IP detection
export interface CloudflareRequest extends NextRequest {
  cf?: {
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
    asn?: number;
    colo?: string;
    httpProtocol?: string;
    tlsVersion?: string;
    tlsCipher?: string;
    clientTrustScore?: number;
    botManagement?: {
      score?: number;
      verifiedBot?: boolean;
      staticResource?: boolean;
    };
  };
}

// Security configuration constants
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    ADMIN: { requests: 50, window: 15 * 60 * 1000 }, // 50 requests per 15 minutes
    API: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    GENERAL: { requests: 200, window: 15 * 60 * 1000 }, // 200 requests per 15 minutes
    LOGIN: { requests: 5, window: 15 * 60 * 1000 }, // 5 login attempts per 15 minutes
  },
  
  // Blocked countries (if needed)
  BLOCKED_COUNTRIES: [] as string[], // Add country codes like ['CN', 'RU'] if needed
  
  // Allowed countries (Bangladesh focus)
  PRIORITY_COUNTRIES: ['BD', 'IN', 'US', 'GB', 'CA', 'AU'],
  
  // Bot score threshold (0-100, lower = more likely bot)
  BOT_SCORE_THRESHOLD: 30,
  
  // Trust score threshold (0-100, higher = more trustworthy)
  TRUST_SCORE_THRESHOLD: 50,
};

// Enhanced rate limiting with Cloudflare data
const rateLimitMap = new Map<string, { count: number; resetTime: number; country?: string }>();

export function checkEnhancedRateLimit(
  identifier: string,
  limit: { requests: number; window: number },
  country?: string
): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { 
      count: 1, 
      resetTime: now + limit.window,
      country 
    });
    return true;
  }
  
  if (userLimit.count >= limit.requests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Bot detection using Cloudflare data
export function isSuspiciousBot(req: CloudflareRequest): boolean {
  const cf = req.cf;
  
  if (!cf) return false;
  
  // Check bot management score
  if (cf.botManagement?.score !== undefined) {
    return cf.botManagement.score < SECURITY_CONFIG.BOT_SCORE_THRESHOLD;
  }
  
  // Check client trust score
  if (cf.clientTrustScore !== undefined) {
    return cf.clientTrustScore < SECURITY_CONFIG.TRUST_SCORE_THRESHOLD;
  }
  
  return false;
}

// Country-based security checks
export function isBlockedCountry(country?: string): boolean {
  if (!country) return false;
  return SECURITY_CONFIG.BLOCKED_COUNTRIES.includes(country);
}

// Generate security headers optimized for Cloudflare
export function getCloudflareSecurityHeaders(req: CloudflareRequest): Record<string, string> {
  const headers: Record<string, string> = {
    // Basic security headers
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-DNS-Prefetch-Control': 'off',
    
    // HSTS with preload (Cloudflare compatible)
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    
    // Permissions Policy
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'speaker=()',
      'vibrate=()',
      'fullscreen=(self)',
      'sync-xhr=()'
    ].join(', '),
    
    // Custom security headers
    'X-Powered-By': '', // Remove server fingerprinting
    'Server': '', // Remove server fingerprinting
  };
  
  // Add Cloudflare-specific headers if available
  if (req.cf) {
    headers['X-Country-Code'] = req.cf.country || 'unknown';
    headers['X-Cloudflare-Colo'] = req.cf.colo || 'unknown';
  }
  
  return headers;
}

// Enhanced CSP for Cloudflare
export function getCloudflareCSP(nonce?: string): string {
  const nonceStr = nonce ? `'nonce-${nonce}'` : '';
  
  return [
    "default-src 'self'",
    `script-src 'self' ${nonceStr} 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://static.cloudflareinsights.com https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.vercel.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.facebook.com https://connect.facebook.net https://cloudflareinsights.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.facebook.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; ');
}

// Security event logging
export interface SecurityEvent {
  type: 'rate_limit' | 'bot_detected' | 'country_blocked' | 'suspicious_activity';
  ip: string;
  country?: string;
  userAgent?: string;
  path: string;
  timestamp: number;
  details?: any;
}

export function logSecurityEvent(event: SecurityEvent): void {
  // In production, send to your logging service
  console.warn('Security Event:', {
    ...event,
    timestamp: new Date(event.timestamp).toISOString()
  });
  
  // You can integrate with services like:
  // - Cloudflare Analytics
  // - Supabase logging
  // - External SIEM systems
}

// IP whitelist for trusted sources
export const TRUSTED_IPS = [
  // Add your trusted IP ranges here
  // '192.168.1.0/24', // Local network
  // '10.0.0.0/8', // Private network
];

export function isTrustedIP(ip: string): boolean {
  // Implement IP range checking logic here
  return TRUSTED_IPS.some((range: string) => {
    // Simple check - in production use proper CIDR matching
    const baseIP = range.split('/')[0];
    return ip.startsWith(baseIP.slice(0, baseIP.lastIndexOf('.')));
  });
}

// Challenge page configuration
export function shouldChallenge(req: CloudflareRequest): boolean {
  // Challenge suspicious requests
  if (isSuspiciousBot(req)) return true;
  
  // Challenge requests from blocked countries
  if (isBlockedCountry(req.cf?.country)) return true;
  
  // Challenge based on path sensitivity
  const sensitivePaths = ['/admin', '/api/admin', '/auth/login'];
  if (sensitivePaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return isSuspiciousBot(req) || (req.cf?.clientTrustScore || 100) < 70;
  }
  
  return false;
}

// Generate challenge response
export function createChallengeResponse(reason: string): NextResponse {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Security Check - Tech Nirvor</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .logo { margin-bottom: 30px; }
        h1 { color: #333; }
        p { color: #666; line-height: 1.6; }
        .reason { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>🛡️ Tech Nirvor Security</h1>
        </div>
        <h1>Security Verification Required</h1>
        <p>We're verifying that you're a human and not a bot. This helps us protect our platform and ensure the best experience for all users.</p>
        <div class="reason">
          <strong>Reason:</strong> ${reason}
        </div>
        <p>Please wait a moment while we verify your request...</p>
        <script>
          // Auto-refresh after 5 seconds
          setTimeout(() => window.location.reload(), 5000);
        </script>
      </div>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    status: 403,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Challenge-Reason': reason
    }
  });
}

export default {
  SECURITY_CONFIG,
  checkEnhancedRateLimit,
  isSuspiciousBot,
  isBlockedCountry,
  getCloudflareSecurityHeaders,
  getCloudflareCSP,
  logSecurityEvent,
  shouldChallenge,
  createChallengeResponse,
  isTrustedIP
};