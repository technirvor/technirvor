import type React from 'react';
import { Suspense } from 'react';
import AdminNavbar from '@/components/admin-navbar';
import { Toaster } from '@/components/ui/sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="flex-1">
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
      <Toaster position="top-right" />
    </div>
  );
}
