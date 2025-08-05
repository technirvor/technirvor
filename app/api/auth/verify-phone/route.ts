import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  PhoneVerificationData,
  PhoneVerificationResponse,
} from "@/lib/types/user";
import { normalizeBangladeshiPhone } from "@/lib/utils/phone-validation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body: PhoneVerificationData = await request.json();

    if (!body.phone || !body.verification_code) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number and verification code are required",
        },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizeBangladeshiPhone(body.phone);

    // Get the verification record
    const { data: verification, error: verificationError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("phone", normalizedPhone)
      .eq("verification_code", body.verification_code)
      .eq("is_verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verificationError || !verification) {
      // Increment attempts for any existing verification
      await supabase
        .from("phone_verifications")
        .update({
          attempts: supabase.rpc("increment_attempts", {
            phone_number: normalizedPhone,
          }),
        })
        .eq("phone", normalizedPhone)
        .eq("is_verified", false);

      return NextResponse.json(
        { success: false, message: "Invalid or expired verification code" },
        { status: 400 },
      );
    }

    // Check if too many attempts
    if (verification.attempts >= 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many verification attempts. Please request a new code.",
        },
        { status: 429 },
      );
    }

    // Mark verification as completed
    const { error: updateVerificationError } = await supabase
      .from("phone_verifications")
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", verification.id);

    if (updateVerificationError) {
      console.error("Failed to update verification:", updateVerificationError);
      return NextResponse.json(
        { success: false, message: "Failed to verify phone number" },
        { status: 500 },
      );
    }

    // Update user's phone verification status
    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        phone_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("phone", normalizedPhone);

    if (updateUserError) {
      console.error("Failed to update user:", updateUserError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update user verification status",
        },
        { status: 500 },
      );
    }

    // Get user data for response
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("phone", normalizedPhone)
      .single();

    // Check if this verification completes a referral
    if (user) {
      const { data: referral } = await supabase
        .from("user_referrals")
        .select("*")
        .eq("referred_user_id", user.id)
        .eq("status", "pending")
        .single();

      if (referral) {
        // Complete the referral
        await supabase
          .from("user_referrals")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", referral.id);

        // Award referral bonus to referrer
        const referralBonus = 100; // Points

        // Update referrer's rewards
        await supabase
          .from("user_rewards")
          .update({
            total_points: supabase.rpc("increment_points", {
              points: referralBonus,
            }),
            available_points: supabase.rpc("increment_points", {
              points: referralBonus,
            }),
            total_earned: supabase.rpc("increment_points", {
              points: referralBonus,
            }),
          })
          .eq("user_id", referral.referrer_user_id);

        // Create reward transaction for referrer
        await supabase.from("reward_transactions").insert({
          user_id: referral.referrer_user_id,
          transaction_type: "earned",
          points: referralBonus,
          description: `Referral bonus for referring ${user.full_name}`,
          reference_type: "referral",
          reference_id: referral.id,
        });

        // Award bonus to referred user as well
        const referredBonus = 50; // Points

        await supabase
          .from("user_rewards")
          .update({
            total_points: supabase.rpc("increment_points", {
              points: referredBonus,
            }),
            available_points: supabase.rpc("increment_points", {
              points: referredBonus,
            }),
            total_earned: supabase.rpc("increment_points", {
              points: referredBonus,
            }),
          })
          .eq("user_id", user.id);

        await supabase.from("reward_transactions").insert({
          user_id: user.id,
          transaction_type: "earned",
          points: referredBonus,
          description: "Bonus for being referred to Tech Nirvor",
          reference_type: "referral",
          reference_id: referral.id,
        });
      }
    }

    const response: PhoneVerificationResponse = {
      success: true,
      message: "Phone number verified successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Phone verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Resend verification code
export async function PUT(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizeBangladeshiPhone(phone);

    // Check if user exists
    const { data: user } = await supabase
      .from("users")
      .select("id, phone_verified")
      .eq("phone", normalizedPhone)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (user.phone_verified) {
      return NextResponse.json(
        { success: false, message: "Phone number is already verified" },
        { status: 400 },
      );
    }

    // Check rate limiting (max 3 codes per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentCodes, error: countError } = await supabase
      .from("phone_verifications")
      .select("id")
      .eq("phone", normalizedPhone)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Error checking recent codes:", countError);
    } else if (recentCodes && recentCodes.length >= 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many verification codes sent. Please try again later.",
        },
        { status: 429 },
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Store new verification code
    const { error: insertError } = await supabase
      .from("phone_verifications")
      .insert({
        user_id: user.id,
        phone: normalizedPhone,
        verification_code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        attempts: 0,
      });

    if (insertError) {
      console.error("Failed to store verification code:", insertError);
      return NextResponse.json(
        { success: false, message: "Failed to send verification code" },
        { status: 500 },
      );
    }

    // TODO: Send SMS verification code
    // In a real implementation, you would integrate with an SMS service
    console.log(
      `New verification code for ${normalizedPhone}: ${verificationCode}`,
    );

    const response: PhoneVerificationResponse = {
      success: true,
      message: "Verification code sent successfully",
      verification_sent: true,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
