"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { Badge } from "@/components/ui/badge";
import RealTimeSearch from "./real-time-search";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="block dark:hidden">
              <Image
                src="/logo/logo-black.png"
                alt="Tech Nirvor"
                width={220}
                height={60}
                priority
              />
            </span>
            <span className="hidden dark:block">
              <Image
                src="/logo/logo-white.png"
                alt="Tech Nirvor"
                width={220}
                height={60}
                priority
              />
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <RealTimeSearch />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/products"
              className="text-gray-700 hover:text-gray-900"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-gray-900"
            >
              Categories
            </Link>
            <Link
              href="/combo-offers"
              className="text-gray-700 hover:text-gray-900"
            >
              Combo Offers
            </Link>
            <Link
              href="/track-order"
              className="text-gray-700 hover:text-gray-900"
            >
              Track Order
            </Link>
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs">
                  {totalItems}
                </Badge>
              )}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <RealTimeSearch />
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/products"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/combo-offers"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Combo Offers
              </Link>
              <Link
                href="/track-order"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Order
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
