import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  type CloudflareRequest,
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
} from "./lib/cloudflare-security";

// Legacy rate limiting function for backward compatibility
function checkRateLimit(ip: string): boolean {
  return checkEnhancedRateLimit(ip, SECURITY_CONFIG.RATE_LIMITS.GENERAL);
}

export async function middleware(req: CloudflareRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  
  // Enhanced IP detection with Cloudflare headers
  const ip = req.headers.get('cf-connecting-ip') || 
            req.headers.get('x-forwarded-for') || 
            req.headers.get('x-real-ip') || 
            'unknown';
  
  const country = req.cf?.country;
  const userAgent = req.headers.get('user-agent') || '';
  
  // 1. CLOUDFLARE SECURITY CHECKS
  
  // Check for blocked countries
  if (isBlockedCountry(country)) {
    logSecurityEvent({
      type: 'country_blocked',
      ip,
      country,
      userAgent,
      path: pathname,
      timestamp: Date.now()
    });
    return createChallengeResponse(`Access from ${country} is restricted`);
  }
  
  // Check for suspicious bots
  if (isSuspiciousBot(req)) {
    logSecurityEvent({
      type: 'bot_detected',
      ip,
      country,
      userAgent,
      path: pathname,
      timestamp: Date.now(),
      details: { botScore: req.cf?.botManagement?.score, trustScore: req.cf?.clientTrustScore }
    });
    
    // Challenge suspicious bots instead of blocking completely
    if (shouldChallenge(req)) {
      return createChallengeResponse('Suspicious bot activity detected');
    }
  }
  
  // 2. ENHANCED RATE LIMITING
  
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api");
  const isLoginRoute = pathname === "/auth/login";
  
  // Apply different rate limits based on route type
  let rateLimitConfig = SECURITY_CONFIG.RATE_LIMITS.GENERAL;
  let rateLimitKey = ip;
  
  if (isAdminRoute) {
    rateLimitConfig = SECURITY_CONFIG.RATE_LIMITS.ADMIN;
    rateLimitKey = `admin:${ip}`;
  } else if (isApiRoute) {
    rateLimitConfig = SECURITY_CONFIG.RATE_LIMITS.API;
    rateLimitKey = `api:${ip}`;
  } else if (isLoginRoute) {
    rateLimitConfig = SECURITY_CONFIG.RATE_LIMITS.LOGIN;
    rateLimitKey = `login:${ip}`;
  }
  
  // Skip rate limiting for trusted IPs
  if (!isTrustedIP(ip) && !checkEnhancedRateLimit(rateLimitKey, rateLimitConfig, country)) {
    logSecurityEvent({
      type: 'rate_limit',
      ip,
      country,
      userAgent,
      path: pathname,
      timestamp: Date.now(),
      details: { routeType: isAdminRoute ? 'admin' : isApiRoute ? 'api' : isLoginRoute ? 'login' : 'general' }
    });
    
    return new NextResponse('Rate limit exceeded. Please try again later.', { 
      status: 429,
      headers: {
        'Retry-After': '900', // 15 minutes
        'X-RateLimit-Limit': rateLimitConfig.requests.toString(),
        'X-RateLimit-Window': (rateLimitConfig.window / 1000).toString()
      }
    });
  }

  // Admin route authentication check
  const isLoginPage = pathname === "/auth/login";
  if (isAdminRoute) {
    // Use service role key for admin check (server only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const accessToken = req.cookies.get("sb-access-token")?.value;
    
    if (isLoginPage) {
      // If already logged in, redirect away from login page
      if (accessToken) {
        try {
          const { data, error } = await supabase.auth.getUser(accessToken);
          if (!error && data.user) {
            // Check admin_users table
            const { data: adminUser, error: adminError } = await supabase
              .from("admin_users")
              .select("*")
              .eq("user_id", data.user.id)
              .eq("is_active", true)
              .single();
            if (!adminError && adminUser) {
              const returnUrl = req.nextUrl.searchParams.get('returnUrl') || '/admin';
              return NextResponse.redirect(new URL(returnUrl, req.url));
            }
          }
        } catch (error) {
          // Invalid token, allow access to login page
          console.error('Token validation error:', error);
        }
      }
    } else {
      // For all other admin pages, require login
      if (!accessToken) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      try {
        const { data, error } = await supabase.auth.getUser(accessToken);
        if (error || !data.user) {
          const loginUrl = new URL("/auth/login", req.url);
          loginUrl.searchParams.set('returnUrl', pathname);
          return NextResponse.redirect(loginUrl);
        }
        
        // Check admin_users table
        const { data: adminUser, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("is_active", true)
          .single();
          
        if (adminError || !adminUser) {
          const loginUrl = new URL("/auth/login", req.url);
          loginUrl.searchParams.set('returnUrl', pathname);
          return NextResponse.redirect(loginUrl);
        }
        
        // Log admin access for security monitoring
        try {
          await supabase
            .from('admin_activity_logs')
            .insert({
              admin_user_id: adminUser.id,
              action: 'page_access',
              details: { path: pathname, ip, user_agent: req.headers.get('user-agent') },
              ip_address: ip
            });
        } catch (logError) {
          // Don't fail the request if logging fails
          console.error('Failed to log admin activity:', logError);
        }
      } catch (error) {
        console.error('Admin authentication error:', error);
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 3. CLOUDFLARE-OPTIMIZED SECURITY HEADERS
  
  // Apply Cloudflare-optimized security headers
  const securityHeaders = getCloudflareSecurityHeaders(req);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) res.headers.set(key, value);
  });
  
  // Generate CSP nonce for inline scripts (optional)
  const nonce = Math.random().toString(36).substring(2, 15);
  res.headers.set('X-Nonce', nonce);
  
  // Set Cloudflare-optimized CSP
  const csp = getCloudflareCSP(nonce);
  res.headers.set("Content-Security-Policy", csp);
  
  // Additional Cloudflare-specific headers
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
  res.headers.set('X-Request-ID', Math.random().toString(36).substring(2, 15));
  
  // Cache control for security-sensitive pages
  if (isAdminRoute || isApiRoute || isLoginRoute) {
    res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
