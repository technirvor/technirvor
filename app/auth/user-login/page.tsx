"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UserLoginForm from "@/components/auth/UserLoginForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const handleLoginSuccess = (user: any, sessionToken?: string) => {
    // Store user session if needed
    if (sessionToken) {
      localStorage.setItem("user_session_token", sessionToken);
    }

    // Redirect to intended page
    router.push(redirectTo);
  };

  const handleForgotPassword = (phone: string) => {
    // Navigate to forgot password page with phone pre-filled
    router.push(`/auth/forgot-password?phone=${encodeURIComponent(phone)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-2">Welcome back to Tech Nirvor</p>
        </div>

        {/* Login Form */}
        <UserLoginForm
          onSuccess={handleLoginSuccess}
          onForgotPassword={handleForgotPassword}
          redirectTo={redirectTo}
        />

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Admin Login Link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Are you an admin?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Admin Login
            </Link>
          </p>
        </div>

        {/* Benefits Reminder */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-medium text-gray-900 mb-4 text-center">
            Member Benefits
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">🎁</div>
              <p className="text-gray-600">Reward Points</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <p className="text-gray-600">Order Tracking</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-gray-600">Exclusive Deals</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🚚</div>
              <p className="text-gray-600">Fast Checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
