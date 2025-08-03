"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/hooks/use-sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Package,
  ShoppingCart,
  Settings,
  BarChart3,
  Tag,
  Zap,
  Gift,
  ImageIcon,
  MapPin,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationSections = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: Home,
        description: "Overview and analytics",
      },
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        description: "Sales insights",
      },
    ],
  },
  {
    title: "Sales & Orders",
    items: [
      {
        name: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        description: "Manage customer orders",
        badge: "priority",
      },
    ],
  },
  {
    title: "Catalog Management",
    items: [
      {
        name: "Products",
        href: "/admin/products",
        icon: Package,
        description: "Product catalog",
      },
      {
        name: "Categories",
        href: "/admin/categories",
        icon: Tag,
        description: "Product categories",
      },
      {
        name: "Combo Products",
        href: "/admin/combo-products",
        icon: Gift,
        description: "Product bundles",
      },
      {
        name: "Flash Sale",
        href: "/admin/flash-sale",
        icon: Zap,
        description: "Limited time offers",
      },
    ],
  },
  {
    title: "Content & Media",
    items: [
      {
        name: "Hero Slides",
        href: "/admin/hero-slides",
        icon: ImageIcon,
        description: "Homepage banners",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        name: "Districts",
        href: "/admin/districts",
        icon: MapPin,
        description: "Delivery areas",
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: Users,
        description: "User management",
      },
    ],
  },
  {
    title: "Security & System",
    items: [
      {
        name: "Security",
        href: "/admin/security",
        icon: Shield,
        description: "Security monitoring",
        badge: "new",
      },
      {
        name: "Settings",
        href: "/admin/settings",
        icon: Settings,
        description: "System configuration",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl z-30 backdrop-blur-sm",
        collapsed ? "w-16" : "w-72"
      )}
    >
      {/* Logo and Toggle */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">Tech Nirvor</span>
                <p className="text-slate-400 text-xs">Admin Dashboard</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <Shield className="h-6 w-6 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                 <h3 className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                   {section.title}
                 </h3>
               )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={cn(
                           "flex items-center gap-3 px-3 py-3 mx-1 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                           isActive
                             ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                             : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-sm"
                         )}
                      >
                        <Icon className={cn(
                           "h-5 w-5 flex-shrink-0",
                           isActive ? "text-white" : "text-slate-400"
                         )} />
                        {!collapsed && (
                          <>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{item.name}</span>
                                <div className="flex items-center gap-1">
                                  {item.badge === "priority" && (
                                    <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                                  )}
                                  {item.badge === "new" && (
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                      NEW
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className={cn(
                                 "text-xs mt-0.5",
                                 isActive ? "text-blue-100" : "text-slate-500"
                               )}>
                                {item.description}
                              </p>
                            </div>
                          </>
                        )}
                        {collapsed && (
                          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap shadow-lg">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-300 text-xs">{item.description}</div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {!collapsed && section !== navigationSections[navigationSections.length - 1] && (
                 <Separator className="my-4 mx-3 bg-slate-700/50" />
               )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 mt-auto">
        {!collapsed ? (
          <div className="text-xs text-slate-400 text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
            <p className="text-slate-500">v2.0.0 • Secure</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}