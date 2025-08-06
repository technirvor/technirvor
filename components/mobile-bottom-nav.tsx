"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, List, Package, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      isActive: pathname === "/",
    },
    {
      href: "/products",
      icon: Package,
      label: "Products",
      isActive: pathname === "/products",
    },
    {
      href: "/combo-offers",
      icon: Gift,
      label: "Combos",
      isActive: pathname === "/combo-offers",
    },
    {
      href: "/categories",
      icon: List,
      label: "Categories",
      isActive: pathname === "/categories",
    },
    {
      href: "/cart",
      icon: ShoppingCart,
      label: "Cart",
      isActive: pathname === "/cart",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-white/95 backdrop-blur-lg border-t border-gray-100 dark:bg-gray-900/95 dark:border-gray-800 md:hidden">
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-blue-950/20" />

        {/* Navigation container */}
        <div className="relative px-4 py-2">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 group min-w-[60px]",
                    item.isActive
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 scale-105"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105",
                  )}
                >
                  {/* Active indicator */}
                  {item.isActive && (
                    <div className="absolute -top-1 w-8 h-1 bg-white rounded-full" />
                  )}

                  {/* Icon container */}
                  <div
                    className={cn(
                      "relative p-1.5 rounded-xl transition-all duration-300",
                      item.isActive
                        ? "bg-white/20 backdrop-blur-sm"
                        : "group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-all duration-300",
                        item.isActive
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                      )}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-xs font-medium mt-1 transition-all duration-300",
                      item.isActive
                        ? "text-white font-semibold"
                        : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Ripple effect */}
                  {item.isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
