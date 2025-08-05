"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  MessageCircle,
  Ticket,
  Gift,
  User,
  ShoppingBag,
  Star,
  TrendingUp,
  Calendar,
  Award,
  LogOut,
} from "lucide-react";
import { getUserProfile } from "@/lib/services/user-auth";
import { getUnreadNotificationCount } from "@/lib/services/notification-service";
import { getUnreadMessageCount } from "@/lib/services/messaging-service";
import { getUserCoupons } from "@/lib/services/coupon-service";
import { UserDashboardData, Coupon } from "@/lib/types/user";
import UserDashboard from "@/components/user/UserDashboard";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import MessagingDashboard from "@/components/messaging/MessagingDashboard";
import CouponList from "@/components/coupons/CouponList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type TabType = "overview" | "notifications" | "messages" | "coupons";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("session_token") ||
      localStorage.getItem("user_session_token");
    if (!token) {
      router.push("/auth/user-login?redirect=/dashboard");
      return;
    }
    setSessionToken(token);
    loadDashboardData(token);
  }, [router]);

  const loadDashboardData = async (token: string) => {
    try {
      setLoading(true);

      // Load user profile
      const profileResponse = await getUserProfile(token);
      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data);
      } else {
        setError("Failed to load user profile");
        return;
      }

      // Load notification count
      const notificationResponse = await getUnreadNotificationCount(token);
      if (
        notificationResponse.success &&
        notificationResponse.count !== undefined
      ) {
        setUnreadNotifications(notificationResponse.count);
      }

      // Load message count
      const messageResponse = await getUnreadMessageCount(token);
      if (messageResponse.success && messageResponse.count !== undefined) {
        setUnreadMessages(messageResponse.count);
      }

      // Load coupon count
      const couponResponse = await getUserCoupons(token);
      if (couponResponse.success && couponResponse.coupons) {
        const validCoupons = couponResponse.coupons.filter(
          (coupon: Coupon) =>
            !coupon.is_used && new Date(coupon.expires_at) > new Date(),
        );
        setAvailableCoupons(validCoupons.length);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("session_token");
    localStorage.removeItem("user_session_token");
    router.push("/auth/user-login");
  };

  const tabs = [
    {
      id: "overview" as TabType,
      label: "Overview",
      icon: User,
      badge: null,
    },
    {
      id: "notifications" as TabType,
      label: "Notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
    {
      id: "messages" as TabType,
      label: "Messages",
      icon: MessageCircle,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      id: "coupons" as TabType,
      label: "Coupons",
      icon: Ticket,
      badge: availableCoupons > 0 ? availableCoupons : null,
    },
  ];

  const renderQuickStats = () => {
    if (!userProfile) return null;

    const stats = [
      {
        label: "Total Orders",
        value: userProfile.orderStats?.total_orders || 0,
        icon: ShoppingBag,
        color: "bg-blue-500",
      },
      {
        label: "Reward Points",
        value: userProfile.rewards?.available_points || 0,
        icon: Star,
        color: "bg-yellow-500",
      },
      {
        label: "Total Spent",
        value: `৳${(userProfile.orderStats?.total_spent || 0).toFixed(2)}`,
        icon: TrendingUp,
        color: "bg-green-500",
      },
      {
        label: "Current Tier",
        value: userProfile.currentTier?.tier_name || "Bronze",
        icon: Award,
        color: "bg-purple-500",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return userProfile ? (
          <UserDashboard userId={userProfile.user.id} />
        ) : null;

      case "notifications":
        return (
          <NotificationCenter
            sessionToken={sessionToken}
            onClose={() => {
              // Refresh notification count
              getUnreadNotificationCount(sessionToken).then((response) => {
                if (response.success && response.count !== undefined) {
                  setUnreadNotifications(response.count);
                }
              });
            }}
          />
        );

      case "messages":
        return <MessagingDashboard sessionToken={sessionToken} />;

      case "coupons":
        return <CouponList sessionToken={sessionToken} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => router.push("/auth/user-login")}
            className="w-full"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              {userProfile && (
                <div className="hidden md:block">
                  <p className="text-sm text-gray-600">
                    Welcome back,{" "}
                    <span className="font-medium">
                      {userProfile.user.full_name}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {unreadNotifications > 0 && (
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  </button>
                )}

                {unreadMessages > 0 && (
                  <button
                    onClick={() => setActiveTab("messages")}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  </button>
                )}
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {activeTab === "overview" && renderQuickStats()}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {tab.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {tab.badge > 9 ? "9+" : tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">{renderTabContent()}</div>
      </main>
    </div>
  );
}
