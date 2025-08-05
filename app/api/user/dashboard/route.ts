import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { UserProfileResponse, UserDashboardData } from "@/lib/types/user";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 },
      );
    }

    const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate session token
    const { data: session, error: sessionError } = await supabase
      .from("user_sessions")
      .select("user_id, expires_at")
      .eq("session_token", sessionToken)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    const userId = session.user_id;

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Get user rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("user_rewards")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (rewardsError) {
      console.error("Rewards fetch error:", rewardsError);
    }

    // Get current tier
    const { data: currentTier, error: tierError } = await supabase
      .from("reward_tiers")
      .select("*")
      .eq("id", rewards?.tier_id || "bronze")
      .single();

    if (tierError) {
      console.error("Tier fetch error:", tierError);
    }

    // Get next tier
    const { data: nextTier } = await supabase
      .from("reward_tiers")
      .select("*")
      .gt("min_points", rewards?.total_points || 0)
      .order("min_points", { ascending: true })
      .limit(1)
      .single();

    // Get recent orders (last 5)
    const { data: recentOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_phone", user.phone)
      .order("created_at", { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error("Orders fetch error:", ordersError);
    }

    // Get recent reward transactions (last 10)
    const { data: recentTransactions, error: transactionsError } =
      await supabase
        .from("reward_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

    if (transactionsError) {
      console.error("Transactions fetch error:", transactionsError);
    }

    // Get referral stats
    const { data: referrals, error: referralsError } = await supabase
      .from("user_referrals")
      .select("*")
      .eq("referrer_user_id", userId);

    if (referralsError) {
      console.error("Referrals fetch error:", referralsError);
    }

    // Calculate referral stats
    const totalReferrals = referrals?.length || 0;
    const successfulReferrals =
      referrals?.filter((r) => r.status === "completed").length || 0;
    const pendingReferrals =
      referrals?.filter((r) => r.status === "pending").length || 0;
    const totalEarnedFromReferrals =
      referrals?.reduce((sum, r) => sum + (r.reward_points || 0), 0) || 0;

    // Calculate order stats
    const totalOrders = recentOrders?.length || 0;
    const totalSpent =
      recentOrders?.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0,
      ) || 0;
    const lastOrderDate = recentOrders?.[0]?.created_at;

    // Prepare dashboard data
    const dashboardData: UserDashboardData = {
      user: {
        id: user.id,
        auth_user_id: user.auth_user_id,
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        district: user.district,
        address: user.address,
        is_phone_verified: user.phone_verified,
        is_email_verified: user.email_verified,
        profile_image_url: user.profile_image_url,
        registration_date: user.created_at,
        last_login: user.last_login,
        is_active: user.is_active,
        referral_code: user.referral_code,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      rewards: {
        id: rewards?.id || "",
        user_id: userId,
        total_points: rewards?.total_points || 0,
        available_points: rewards?.available_points || 0,
        total_earned: rewards?.total_earned || 0,
        total_redeemed: rewards?.total_redeemed || 0,
        lifetime_points: rewards?.lifetime_points || 0,
        current_tier: rewards?.tier_id || "bronze",
        tier_progress: currentTier
          ? Math.min(
              100,
              ((rewards?.total_points || 0) / (currentTier.max_points || 1)) *
                100,
            )
          : 0,
        next_tier_threshold: nextTier?.min_points,
        created_at: rewards?.created_at || new Date().toISOString(),
        updated_at: rewards?.updated_at || new Date().toISOString(),
      },
      currentTier: currentTier || {
        id: "bronze",
        tier_name: "Bronze",
        min_points: 0,
        max_points: 999,
        benefits: {},
        discount_percentage: 0,
        created_at: new Date().toISOString(),
      },
      nextTier: nextTier,
      recent_orders: recentOrders || [],
      recent_transactions: recentTransactions || [],
      referral_stats: {
        total_referrals: totalReferrals,
        successful_referrals: successfulReferrals,
        pending_referrals: pendingReferrals,
        total_earned_points: totalEarnedFromReferrals,
      },
      referrals: referrals || [],
      orderStats: {
        total_orders: totalOrders,
        total_spent: totalSpent,
        last_order_date: lastOrderDate,
      },
      tier_benefits: currentTier || {
        id: "bronze",
        tier_name: "Bronze",
        min_points: 0,
        max_points: 999,
        benefits: {},
        discount_percentage: 0,
        created_at: new Date().toISOString(),
      },
    };

    const response: UserProfileResponse = {
      success: true,
      data: dashboardData,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
