"use client";

import type React from "react";
import { Suspense } from "react";
import AdminSidebar from "@/components/admin-sidebar";
import AdminTopbar from "@/components/admin-topbar";
import { Toaster } from "@/components/ui/sonner";
import AdminAuthWrapper from "@/components/admin-auth-wrapper";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${
        collapsed ? "ml-16" : "ml-64"
      }`}>
        {/* Top Navigation */}
        <AdminTopbar />
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
}
