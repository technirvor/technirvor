import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  // Rate limiting for admin routes
  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute && !checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
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

  // Security headers - Updated CSP to allow Supabase

  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  res.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );

  // CSP: allow Supabase, Vercel, Facebook Pixel, Google Analytics, and safe inline for scripts/styles
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: https: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https:",
    "style-src 'self' 'unsafe-inline' https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.vercel.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.facebook.com https://connect.facebook.net",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.facebook.com",
    "frame-ancestors 'none'",
  ].join("; ");
  res.headers.set("Content-Security-Policy", csp);

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
