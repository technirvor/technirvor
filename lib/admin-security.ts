import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

// Create Supabase client only when needed and in server environment
function getSupabaseClient() {
  if (typeof window !== 'undefined') {
    // Client-side: use anon key
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } else {
    // Server-side: use service role key
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
}

export interface AdminSecurityConfig {
  maxLoginAttempts?: number;
  lockoutDuration?: number; // in minutes
  sessionTimeout?: number; // in minutes
  requireMFA?: boolean;
}

const defaultConfig: AdminSecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 60,
  requireMFA: false,
};

// Track failed login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export class AdminSecurity {
  private config: AdminSecurityConfig;

  constructor(config: Partial<AdminSecurityConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Check if IP is locked out due to too many failed attempts
  isLockedOut(ip: string): boolean {
    const attempts = loginAttempts.get(ip);
    if (!attempts) return false;

    const lockoutTime = new Date(
      attempts.lastAttempt.getTime() + this.config.lockoutDuration! * 60 * 1000
    );
    
    if (attempts.count >= this.config.maxLoginAttempts! && new Date() < lockoutTime) {
      return true;
    }

    // Reset if lockout period has passed
    if (new Date() >= lockoutTime) {
      loginAttempts.delete(ip);
    }

    return false;
  }

  // Record a failed login attempt
  recordFailedAttempt(ip: string): void {
    const existing = loginAttempts.get(ip) || { count: 0, lastAttempt: new Date() };
    existing.count += 1;
    existing.lastAttempt = new Date();
    loginAttempts.set(ip, existing);
  }

  // Clear failed attempts on successful login
  clearFailedAttempts(ip: string): void {
    loginAttempts.delete(ip);
  }

  // Log admin activity (server-side only)
  async logActivity(
    adminUserId: string,
    action: string,
    details?: any,
    request?: NextRequest
  ): Promise<void> {
    // Skip logging on client-side
    if (typeof window !== 'undefined') {
      return;
    }
    
    try {
      const supabase = getSupabaseClient();
      const ip = request?.headers.get("x-forwarded-for") || "unknown";
      const userAgent = request?.headers.get("user-agent") || "unknown";

      await supabase.from("admin_activity_logs").insert({
        admin_user_id: adminUserId,
        action,
        details: details ? JSON.stringify(details) : null,
        ip_address: ip,
        user_agent: userAgent,
      });
    } catch (error) {
      console.error("Failed to log admin activity:", error);
    }
  }

  // Validate session and check for timeout
  async validateSession(token: string): Promise<{
    isValid: boolean;
    user?: any;
    adminUser?: any;
    error?: string;
  }> {
    try {
      const supabase = getSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return { isValid: false, error: "Invalid session" };
      }

      // Check if user is admin
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (adminError || !adminUser) {
        return { isValid: false, error: "Admin access required" };
      }

      // Check session timeout
      const lastActivity = new Date(adminUser.last_login || adminUser.created_at);
      const sessionExpiry = new Date(
        lastActivity.getTime() + this.config.sessionTimeout! * 60 * 1000
      );

      if (new Date() > sessionExpiry) {
        return { isValid: false, error: "Session expired" };
      }

      return { isValid: true, user, adminUser };
    } catch (error) {
      return { isValid: false, error: "Session validation failed" };
    }
  }

  // Check for suspicious activity patterns (server-side only)
  async checkSuspiciousActivity(adminUserId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
  }> {
    // Skip on client-side
    if (typeof window !== 'undefined') {
      return { isSuspicious: false, reasons: [] };
    }
    
    try {
      const supabase = getSupabaseClient();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { data: recentActivity } = await supabase
        .from("admin_activity_logs")
        .select("*")
        .eq("admin_user_id", adminUserId)
        .gte("created_at", oneHourAgo.toISOString());

      const reasons: string[] = [];
      
      if (recentActivity) {
        // Check for too many actions in short time
        if (recentActivity.length > 100) {
          reasons.push("Excessive activity in the last hour");
        }

        // Check for multiple IP addresses
        const uniqueIPs = new Set(recentActivity.map(log => log.ip_address));
        if (uniqueIPs.size > 3) {
          reasons.push("Activity from multiple IP addresses");
        }

        // Check for failed operations
        const failedActions = recentActivity.filter(log => 
          log.action.includes("failed") || log.action.includes("error")
        );
        if (failedActions.length > 10) {
          reasons.push("Multiple failed operations");
        }
      }

      return {
        isSuspicious: reasons.length > 0,
        reasons
      };
    } catch (error) {
      console.error("Error checking suspicious activity:", error);
      return { isSuspicious: false, reasons: [] };
    }
  }

  // Generate security report (server-side only)
  async generateSecurityReport(adminUserId: string): Promise<{
    totalSessions: number;
    recentActivity: any[];
    securityAlerts: string[];
    lastLogin: Date | null;
  }> {
    // Skip on client-side
    if (typeof window !== 'undefined') {
      return {
        totalSessions: 0,
        recentActivity: [],
        securityAlerts: [],
        lastLogin: null,
      };
    }
    
    try {
      const supabase = getSupabaseClient();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const { data: recentActivity } = await supabase
        .from("admin_activity_logs")
        .select("*")
        .eq("admin_user_id", adminUserId)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("last_login")
        .eq("id", adminUserId)
        .single();

      const suspiciousCheck = await this.checkSuspiciousActivity(adminUserId);
      
      return {
        totalSessions: recentActivity?.length || 0,
        recentActivity: recentActivity || [],
        securityAlerts: suspiciousCheck.reasons,
        lastLogin: adminUser?.last_login ? new Date(adminUser.last_login) : null,
      };
    } catch (error) {
      console.error("Error generating security report:", error);
      return {
        totalSessions: 0,
        recentActivity: [],
        securityAlerts: [],
        lastLogin: null,
      };
    }
  }
}

// Export singleton instance
export const adminSecurity = new AdminSecurity();

// Security headers for admin routes
export const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

// Content Security Policy for admin panel
export const adminCSP = [
  "default-src 'self'",
  "img-src 'self' data: https: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");