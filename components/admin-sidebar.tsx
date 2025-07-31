"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Overview and analytics",
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "Manage customer orders",
    badge: "priority",
  },
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
  {
    name: "Hero Slides",
    href: "/admin/hero-slides",
    icon: ImageIcon,
    description: "Homepage banners",
  },
  {
    name: "Districts",
    href: "/admin/districts",
    icon: MapPin,
    description: "Delivery areas",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Sales insights",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System configuration",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
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
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-blue-100 text-blue-900 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                          {item.badge === "priority" && (
                            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>Tech Nirvor Admin</p>
            <p>v1.0.0</p>
          </div>
        )}
      </div>
    </div>
  );
}