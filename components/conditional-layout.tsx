"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MobileBottomNav from "@/components/mobile-bottom-nav";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current route is an admin route
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    // For admin routes, don't show Navbar, Footer, or MobileBottomNav
    return <main>{children}</main>;
  }

  // For non-admin routes, show the normal layout
  return (
    <>
      <Navbar />
      <main className="pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
