"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Gift,
  Star,
  Trophy,
  Users,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  Copy,
  Share2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
  Crown,
  Coins,
} from "lucide-react";
import {
  UserDashboardData,
  RewardTransaction,
  UserReferral,
} from "@/lib/types/user";
import { getUserProfile } from "@/lib/services/user-auth";
import { formatBangladeshiPhone } from "@/lib/utils/phone-validation";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserDashboardProps {
  userId: string;
  onLogout?: () => void;
}

export default function UserDashboard({
  userId,
  onLogout,
}: UserDashboardProps) {
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const result = await getUserProfile(userId);

      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        setError(result.message || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (dashboardData?.user.referral_code) {
      try {
        await navigator.clipboard.writeText(dashboardData.user.referral_code);
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
      } catch (error) {
        console.error("Failed to copy referral code:", error);
      }
    }
  };

  const shareReferralCode = async () => {
    if (
      dashboardData?.user.referral_code &&
      typeof navigator !== "undefined" &&
      "share" in navigator
    ) {
      try {
        await navigator.share({
          title: "Join Tech Nirvor",
          text: `Use my referral code ${dashboardData.user.referral_code} and get bonus reward points!`,
          url: `${window.location.origin}/auth/register?ref=${dashboardData.user.referral_code}`,
        });
      } catch (error) {
        console.error("Failed to share:", error);
      }
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "bronze":
        return <Trophy className="h-4 w-4 text-amber-600" />;
      case "silver":
        return <Trophy className="h-4 w-4 text-gray-500" />;
      case "gold":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "platinum":
        return <Crown className="h-4 w-4 text-purple-500" />;
      default:
        return <Star className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "bronze":
        return "bg-amber-100 text-amber-800";
      case "silver":
        return "bg-gray-100 text-gray-800";
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "platinum":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <Coins className="h-4 w-4 text-green-500" />;
      case "redeemed":
        return <Gift className="h-4 w-4 text-red-500" />;
      case "referral":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "bonus":
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Failed to load dashboard"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    user,
    rewards,
    currentTier,
    nextTier,
    recent_transactions = [],
    referrals = [],
    orderStats = { total_orders: 0, total_spent: 0 },
  } = dashboardData;
  const progressToNextTier = nextTier
    ? (rewards.total_points / nextTier.min_points) * 100
    : 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account and track your rewards
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/profile/edit")}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Reward Points */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Reward Points
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {rewards.available_points}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Coins className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Tier */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Tier
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {getTierIcon(currentTier.tier_name)}
                  <Badge className={getTierColor(currentTier.tier_name)}>
                    {currentTier.tier_name}
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {orderStats?.total_orders || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Referrals</p>
                <p className="text-2xl font-bold text-orange-600">
                  {referrals?.length || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Tier Progress */}
          {nextTier && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Tier Progress</span>
                </CardTitle>
                <CardDescription>
                  You need {nextTier.min_points - rewards.total_points} more
                  points to reach {nextTier.tier_name} tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentTier.tier_name}</span>
                    <span>{nextTier.tier_name}</span>
                  </div>
                  <Progress
                    value={Math.min(progressToNextTier, 100)}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{rewards.total_points} points</span>
                    <span>{nextTier.min_points} points</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reward Activity</CardTitle>
              <CardDescription>Your latest reward transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recent_transactions && recent_transactions.length > 0 ? (
                  recent_transactions
                    .slice(0, 5)
                    .map((transaction: RewardTransaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.transaction_type)}
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              transaction.transaction_type === "redeemed"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {transaction.transaction_type === "redeemed"
                              ? "-"
                              : "+"}
                            {transaction.points}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent transactions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reward Summary</CardTitle>
              <CardDescription>
                Track your reward points and tier benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {rewards.available_points}
                  </p>
                  <p className="text-sm text-gray-600">Available Points</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {rewards.total_earned}
                  </p>
                  <p className="text-sm text-gray-600">Total Earned</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {rewards.total_redeemed}
                  </p>
                  <p className="text-sm text-gray-600">Total Redeemed</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Current Tier Benefits</h4>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {getTierIcon(currentTier.tier_name)}
                    <Badge className={getTierColor(currentTier.tier_name)}>
                      {currentTier.tier_name}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Tier: {currentTier.tier_name}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Discount: {currentTier.discount_percentage}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>
                Invite friends and earn reward points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Referral Code */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h4 className="font-medium mb-2">Your Referral Code</h4>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-white border rounded text-lg font-mono">
                    {user.referral_code}
                  </code>
                  <Button size="sm" onClick={copyReferralCode}>
                    <Copy className="h-4 w-4 mr-1" />
                    {copiedReferral ? "Copied!" : "Copy"}
                  </Button>
                  {typeof navigator !== "undefined" && "share" in navigator && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={shareReferralCode}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Share this code with friends. You'll both get bonus points
                  when they make their first purchase!
                </p>
              </div>

              {/* Referral Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {referrals?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {referrals?.filter(
                      (r: UserReferral) => r.status === "completed",
                    ).length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Successful Referrals</p>
                </div>
              </div>

              {/* Referral List */}
              {referrals && referrals.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Your Referrals</h4>
                  <div className="space-y-2">
                    {referrals.map((referral: UserReferral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            User ID: {referral.referred_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(referral.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            referral.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {referral.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-gray-500">Full Name</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {formatBangladeshiPhone(user.phone, "international")}
                      </p>
                      <p className="text-sm text-gray-500">Phone Number</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-gray-500">Email Address</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {user.date_of_birth
                          ? formatDate(user.date_of_birth)
                          : "Not provided"}
                      </p>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {user.district || "Not provided"}
                      </p>
                      <p className="text-sm text-gray-500">District</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        Member since {formatDate(user.created_at)}
                      </p>
                      <p className="text-sm text-gray-500">Account Created</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Account Status</h4>
                    <p className="text-sm text-gray-500">
                      Your account is active and verified
                    </p>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    {user.is_phone_verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
