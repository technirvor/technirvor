import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Admin route authentication check
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
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
            return NextResponse.redirect(new URL("/admin", req.url));
          }
        }
      }
    } else {
      // For all other admin pages, require login
      if (!accessToken) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error || !data.user) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      // Check admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", data.user.id)
        .eq("is_active", true)
        .single();
      if (adminError || !adminUser) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
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
