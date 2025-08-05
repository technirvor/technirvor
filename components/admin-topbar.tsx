"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  LogOut,
  Settings,
  User,
  Shield,
  Activity,
  Clock,
} from "lucide-react";
import AdminNotifications from "./admin-notifications";
import { checkAdminAccess } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const getPageTitle = (pathname: string) => {
  const routes: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/orders": "Orders Management",
    "/admin/products": "Products",
    "/admin/categories": "Categories",
    "/admin/combo-products": "Combo Products",
    "/admin/flash-sale": "Flash Sale",
    "/admin/hero-slides": "Hero Slides",
    "/admin/districts": "Districts",
    "/admin/analytics": "Analytics",
    "/admin/security": "Security Dashboard",
    "/admin/users": "User Management",
    "/admin/settings": "Settings",
  };

  // Check for exact match first
  if (routes[pathname]) {
    return routes[pathname];
  }

  // Check for partial matches (e.g., /admin/products/new)
  for (const [route, title] of Object.entries(routes)) {
    if (pathname.startsWith(route + "/")) {
      return title;
    }
  }

  return "Admin Panel";
};

export default function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const loadingRef = useRef(false);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loadingRef.current) {
      loadingRef.current = true;
      checkAuth();
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const { isAdmin, user } = await checkAdminAccess();
      if (!isAdmin) {
        router.replace("/auth/login");
        return;
      }
      setAdminUser(user);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Auth check failed:", error);
      }
      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSignOut = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous logout attempts

    setLoading(true);
    try {
      // Clear session cookie first to prevent middleware conflicts
      document.cookie =
        "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";

      // Sign out from Supabase
      await supabase.auth.signOut({ scope: "local" });

      toast.success("Signed out successfully");

      // Use window.location for immediate redirect to avoid router conflicts
      window.location.href = "/auth/login";
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Sign out error:", error);
      }
      toast.error("Failed to sign out");
      // Fallback redirect even on error
      window.location.href = "/auth/login";
    }
  }, [loading]);

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  const pageTitle = getPageTitle(pathname);
  const userInitials =
    adminUser?.email
      ?.split("@")[0]
      ?.split(".")
      ?.map((n: string) => n[0])
      ?.join("")
      ?.toUpperCase() || "AD";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Page Title and Breadcrumb */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Clock className="h-3 w-3" />
              <span>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Security Status */}
          <Badge variant="outline" className="text-green-700 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Secure
          </Badge>

          {/* Activity Indicator */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Activity className="h-4 w-4 text-green-500" />
            <span>Online</span>
          </div>

          {/* Notifications */}
          <AdminNotifications />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full border border-gray-200 hover:border-gray-300"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {adminUser?.email?.split("@")[0] || "Admin"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {adminUser?.email || "admin@example.com"}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleSignOut}
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
