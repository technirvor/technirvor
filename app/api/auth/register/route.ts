import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UserRegistrationData, UserRegistrationResponse } from '@/lib/types/user';
import { validatePhoneForRegistration, generateVerificationCode, normalizeBangladeshiPhone } from '@/lib/utils/phone-validation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body: UserRegistrationData = await request.json();

    // Validate required fields
    if (!body.full_name || !body.phone || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate Bangladeshi phone number
    const phoneValidation = validatePhoneForRegistration(body.phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid Bangladeshi phone number' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeBangladeshiPhone(body.phone);

    // Check if phone number already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Phone number already registered' },
        { status: 409 }
      );
    }

    // Check if email already exists (if provided)
    if (body.email) {
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', body.email)
        .single();

      if (existingEmail) {
        return NextResponse.json(
          { success: false, message: 'Email already registered' },
          { status: 409 }
        );
      }
    }

    // Note: Supabase handles password hashing automatically

    // Generate referral code
    const referralCode = `TN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      phone: normalizedPhone,
      email: body.email || undefined,
      password: body.password,
      email_confirm: body.email ? false : true,
      phone_confirm: false,
      user_metadata: {
        full_name: body.full_name,
        referral_code: referralCode
      }
    });

    if (authError || !authUser.user) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { success: false, message: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create user profile in users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        full_name: body.full_name,
        phone: normalizedPhone,
        email: body.email || null,
        date_of_birth: body.date_of_birth || null,
        gender: body.gender || null,
        district: body.district || null,
        address: body.address || null,
        referral_code: referralCode,
        phone_verified: false,
        email_verified: body.email ? false : true
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { success: false, message: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Create user rewards record
    const { error: rewardsError } = await supabase
      .from('user_rewards')
      .insert({
        user_id: authUser.user.id,
        total_points: 100, // Welcome bonus
        available_points: 100,
        total_earned: 100,
        total_redeemed: 0,
        tier_id: 'bronze' // Default tier
      });

    if (rewardsError) {
      console.error('Rewards creation error:', rewardsError);
    }

    // Create welcome reward transaction
    const { error: transactionError } = await supabase
      .from('reward_transactions')
      .insert({
        user_id: authUser.user.id,
        transaction_type: 'earned',
        points: 100,
        description: 'Welcome bonus for joining Tech Nirvor',
        reference_type: 'registration',
        reference_id: authUser.user.id
      });

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
    }

    // Handle referral if provided
    if (body.referral_code) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', body.referral_code)
        .single();

      if (referrer) {
        // Create referral record
        await supabase
          .from('user_referrals')
          .insert({
            referrer_user_id: referrer.id,
            referred_user_id: authUser.user.id,
            referral_code: body.referral_code,
            status: 'pending'
          });
      }
    }

    // Generate and store phone verification code
    const verificationCode = generateVerificationCode();
    const { error: verificationError } = await supabase
      .from('phone_verifications')
      .insert({
        user_id: authUser.user.id,
        phone: normalizedPhone,
        verification_code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        attempts: 0
      });

    if (verificationError) {
      console.error('Verification code error:', verificationError);
    }

    // TODO: Send SMS verification code
    // In a real implementation, you would integrate with an SMS service
    console.log(`Verification code for ${normalizedPhone}: ${verificationCode}`);

    const response: UserRegistrationResponse = {
      success: true,
      message: 'Registration successful. Please verify your phone number.',
      user: {
        id: authUser.user.id,
        auth_user_id: authUser.user.id,
        full_name: body.full_name,
        phone: normalizedPhone,
        email: body.email || '',
        is_phone_verified: false,
        is_email_verified: body.email ? false : true,
        date_of_birth: body.date_of_birth || undefined,
        gender: body.gender || undefined,
        district: body.district || undefined,
        address: body.address || undefined,
        referral_code: referralCode,
        registration_date: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      verification_required: true
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}