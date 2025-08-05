"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { checkAdminAccess } from "@/lib/auth";
import { Shield, AlertTriangle } from "lucide-react";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { isAdmin, user } = await checkAdminAccess();

        if (!isAdmin || !user) {
          // Clear any existing session data
          document.cookie =
            "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

          // Redirect to login with return URL
          const returnUrl = encodeURIComponent(pathname);
          router.replace(`/auth/login?returnUrl=${returnUrl}`);
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Admin authentication failed:", error);
        setError("Authentication failed. Please try again.");

        // Clear session and redirect to login
        document.cookie =
          "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.replace("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAccess();
  }, [router, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Admin Access
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait while we verify your credentials...
          </p>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.replace("/auth/login")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Authenticated state - render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback - should not reach here
  return null;
}
