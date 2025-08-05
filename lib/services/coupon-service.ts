import { createClient } from "@supabase/supabase-js";
import { Coupon, ApplyCouponData, ApplyCouponResponse } from "@/lib/types/user";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get user's available coupons
 */
export async function getUserCoupons(sessionToken: string): Promise<{
  success: boolean;
  coupons?: Coupon[];
  message?: string;
}> {
  try {
    const response = await fetch("/api/coupons", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get user coupons error:", error);
    return {
      success: false,
      message: "Failed to fetch coupons",
    };
  }
}

/**
 * Apply a coupon to an order
 */
export async function applyCoupon(
  sessionToken: string,
  request: ApplyCouponData,
): Promise<ApplyCouponResponse> {
  try {
    const response = await fetch("/api/coupons", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Apply coupon error:", error);
    return {
      success: false,
      message: "Failed to apply coupon",
    };
  }
}

/**
 * Mark a coupon as used
 */
export async function markCouponAsUsed(
  sessionToken: string,
  couponId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch("/api/coupons", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coupon_id: couponId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Mark coupon as used error:", error);
    return {
      success: false,
      message: "Failed to mark coupon as used",
    };
  }
}

/**
 * Validate a coupon code
 */
export async function validateCouponCode(couponCode: string): Promise<{
  success: boolean;
  coupon?: Coupon;
  message?: string;
}> {
  try {
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !coupon) {
      return {
        success: false,
        message: "Invalid or expired coupon code",
      };
    }

    return {
      success: true,
      coupon,
    };
  } catch (error) {
    console.error("Validate coupon code error:", error);
    return {
      success: false,
      message: "Failed to validate coupon code",
    };
  }
}

/**
 * Calculate discount amount based on coupon
 */
export function calculateDiscount(coupon: Coupon, orderAmount: number): number {
  if (coupon.discount_type === "percentage") {
    const discount = (orderAmount * coupon.discount_value) / 100;
    // No max discount amount limit for percentage coupons in current schema
    return discount;
  } else {
    // Fixed amount discount
    return Math.min(coupon.discount_value, orderAmount);
  }
}

/**
 * Check if coupon is valid for minimum order amount
 */
export function isCouponValidForOrder(
  coupon: Coupon,
  orderAmount: number,
): boolean {
  if (
    coupon.minimum_order_amount &&
    orderAmount < coupon.minimum_order_amount
  ) {
    return false;
  }
  return true;
}
