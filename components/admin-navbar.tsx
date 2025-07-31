"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  Home,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  BarChart3,
  Tag,
  Zap,
} from "lucide-react";
import AdminNotifications from "./admin-notifications";
import { checkAdminAccess } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Flash Sale", href: "/admin/flash-sale", icon: Zap },
  { name: "Combo Products", href: "/admin/combo-products", icon: Package },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Prevent double calls in React 18 StrictMode
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
      // Only log in dev
      if (process.env.NODE_ENV !== "production") {
        console.error("Auth check failed:", error);
      }
      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      router.replace("/auth/login");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Sign out error:", error);
      }
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center h-20 gap-4 py-2">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="h-10 w-36 bg-gray-200 rounded-lg" />
              <div className="hidden md:block h-8 w-24 bg-gray-200 rounded-lg" />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="md:hidden h-10 w-10 bg-gray-200 rounded-full" />
            </div>
          </div>
          <div className="flex md:hidden gap-2 mt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center h-auto min-h-[4rem] gap-4 py-2">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/admin" className="flex items-center gap-2 group">
              <span className="text-xl md:text-2xl font-extrabold text-blue-700 group-hover:text-blue-900 transition-colors">
                Admin Panel
              </span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-2 lg:gap-4 ml-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-blue-100 text-blue-900 shadow"
                        : "text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <AdminNotifications />
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border border-blue-100 shadow-sm"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-200 text-blue-900 font-bold">
                      {adminUser?.email?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60 rounded-xl shadow-lg border-blue-50"
                align="end"
                forceMount
              >
                <div className="flex items-center gap-3 p-3 border-b border-blue-50">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-900 font-bold">
                      {adminUser?.email?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-blue-900">
                      {adminUser?.email}
                    </span>
                    <span className="text-xs text-blue-600">Super Admin</span>
                  </div>
                </div>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden border border-blue-100"
                >
                  <Menu className="h-6 w-6 text-blue-700" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 bg-white border-l border-blue-50"
              >
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="px-2 py-1 text-base font-bold text-blue-900">
                    Navigation
                  </div>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-blue-100 text-blue-900 shadow"
                            : "text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Mobile nav skeleton for extra links */}
        <div className="flex md:hidden gap-2 mt-2 justify-center">
          {navigation.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex-1 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
