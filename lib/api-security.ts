import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface SecurityConfig {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  allowedMethods?: string[];
}

export async function validateRequest(
  request: NextRequest,
  config: SecurityConfig = {},
) {
  const {
    requireAuth = false,
    requireAdmin = false,
    rateLimit,
    allowedMethods = ["GET", "POST", "PUT", "DELETE"],
  } = config;

  // Method validation
  if (!allowedMethods.includes(request.method)) {
    return {
      isValid: false,
      error: "Method not allowed",
      status: 405,
    };
  }

  // Rate limiting
  if (rateLimit) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await rateLimitCheck(
      `${ip}:${request.nextUrl.pathname}`,
      rateLimit.requests,
      Math.floor(rateLimit.windowMs / 1000),
    );

    if (!rateLimitResult.isAllowed) {
      return {
        isValid: false,
        error: "Rate limit exceeded",
        status: 429,
      };
    }
  }

  // Authentication check
  if (requireAuth || requireAdmin) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return {
        isValid: false,
        error: "Authentication required",
        status: 401,
      };
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return {
          isValid: false,
          error: "Invalid token",
          status: 401,
        };
      }

      // Admin check
      if (requireAdmin) {
        const { data: adminUser, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (adminError || !adminUser || !adminUser.is_active) {
          return {
            isValid: false,
            error: "Admin access required",
            status: 403,
          };
        }

        return {
          isValid: true,
          user,
          adminUser,
        };
      }

      return {
        isValid: true,
        user,
      };
    } catch (error) {
      return {
        isValid: false,
        error: "Authentication failed",
        status: 401,
      };
    }
  }

  return { isValid: true };
}

export async function logAdminActivity(
  adminUserId: string,
  action: string,
  details?: any,
) {
  try {
    await supabase.from("admin_activity_logs").insert({
      admin_user_id: adminUserId,
      action,
      details,
      ip_address: "server",
      user_agent: "server",
    });
  } catch (error) {
    console.error("Failed to log admin activity:", error);
  }
}

/**
 * Validate an API key sent via the `x-api-key` header.
 * Falls back to `API_KEY` if you prefer a server-only secret.
 */
export function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const validKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

  if (!apiKey || apiKey !== validKey) {
    return { isValid: false, error: "Invalid API key" };
  }

  return { isValid: true };
}

/**
 * Simple in-memory rate-limiter.
 * For production replace this with Upstash/Redis or a DB procedure.
 */
const rateLimitState = new Map<
  string,
  { windowStart: number; count: number }
>();

export async function rateLimitCheck(
  identifier: string,
  limit = 100,
  windowSeconds = 60,
) {
  const now = Date.now();
  const windowStart = Math.floor(now / 1000 / windowSeconds) * windowSeconds;

  const record = rateLimitState.get(identifier);

  if (!record || record.windowStart !== windowStart) {
    // start a new window
    rateLimitState.set(identifier, { windowStart, count: 1 });
    return { isAllowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { isAllowed: false, remaining: 0 };
  }

  record.count += 1;
  return { isAllowed: true, remaining: limit - record.count };
}
