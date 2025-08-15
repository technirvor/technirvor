import { createClient } from "@supabase/supabase-js";
import { adminSecurity } from "./admin-security";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const adminAuth = {
  async signIn(email: string, password: string, ip?: string) {
    try {
      // Check for IP lockout
      if (ip && adminSecurity.isLockedOut(ip)) {
        throw new Error("Too many failed attempts. Please try again later.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Record failed attempt
        if (ip) {
          adminSecurity.recordFailedAttempt(ip);
        }
        throw error;
      }

      // Check if user has admin privileges
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (adminError || !adminUser) {
        await supabase.auth.signOut();
        if (ip) {
          adminSecurity.recordFailedAttempt(ip);
        }
        throw new Error("Admin privileges required");
      }

      if (!adminUser.is_active) {
        await supabase.auth.signOut();
        if (ip) {
          adminSecurity.recordFailedAttempt(ip);
        }
        throw new Error("Admin account is deactivated");
      }

      // Clear failed attempts on successful login
      if (ip) {
        adminSecurity.clearFailedAttempts(ip);
      }

      // Update last login time
      await supabase
        .from("admin_users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", adminUser.id);

      // Log successful login
      await adminSecurity.logActivity(adminUser.id, "admin_login", {
        email,
        success: true,
      });

      // Store session in cookie for middleware
      if (data.session) {
        // Use secure only in production, never on localhost
        const isLocalhost =
          typeof window !== "undefined" &&
          window.location.hostname === "localhost";
        const isProd =
          typeof window !== "undefined" &&
          window.location.protocol === "https:" &&
          !isLocalhost;

        // Set cookie with proper attributes
        const cookieValue = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; samesite=lax${isProd ? "; secure" : ""}`;
        document.cookie = cookieValue;

        // Force a small delay to ensure cookie is written
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      return { user: data.user, adminUser };
    } catch (error) {
      console.error("Admin sign in error:", error);
      throw error;
    }
  },

  async signOut() {
    try {
      // Clear session cookie first to prevent middleware conflicts
      document.cookie =
        "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";

      // Sign out from Supabase with local scope to avoid WebSocket issues
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("Sign out error:", error);
      // Don't throw error to prevent blocking logout flow
    }
  },

  async checkAdminAccess() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return { isAdmin: false, user: null };
      }

      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!adminError && adminUser && adminUser.is_active) {
        return { isAdmin: true, user };
      }
      return { isAdmin: false, user: null };
    } catch (error) {
      console.error("Check admin access error:", error);
      return { isAdmin: false, user: null };
    }
  },

  async getCurrentAdmin() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (adminError || !adminUser) {
        return null;
      }

      return { user, adminUser };
    } catch (error) {
      console.error("Get current admin error:", error);
      return null;
    }
  },
};

/**
 * Named helper so other modules can simply:
 *   import { checkAdminAccess } from "@/lib/auth"
 *
 * It proxies to `adminAuth.checkAdminAccess()` and returns the same result.
 */
export async function checkAdminAccess() {
  return adminAuth.checkAdminAccess();
}
