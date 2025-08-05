// User authentication service

import { createClient } from '@supabase/supabase-js';
import { 
  UserRegistrationData, 
  PhoneVerificationData, 
  LoginData,
  UserRegistrationResponse,
  PhoneVerificationResponse,
  LoginResponse,
  UserProfileResponse,
  UserDashboardData
} from '@/lib/types/user';
import { validateBangladeshiPhone, normalizeBangladeshiPhone, generateVerificationCode } from '@/lib/utils/phone-validation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Anonymous client for public operations
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Registers a new user with phone verification
 */
export async function registerUser(userData: UserRegistrationData): Promise<UserRegistrationResponse> {
  try {
    // Validate Bangladeshi phone number
    const phoneValidation = validateBangladeshiPhone(userData.phone);
    if (!phoneValidation.isValid) {
      return {
        success: false,
        message: phoneValidation.message || 'Invalid phone number'
      };
    }

    const normalizedPhone = phoneValidation.normalized_phone!;

    // Check if phone number is already registered
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: 'This phone number is already registered. Please login instead.'
      };
    }

    // Check if email is already registered (if provided)
    if (userData.email) {
      const { data: existingEmail } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', userData.email.toLowerCase())
        .single();

      if (existingEmail) {
        return {
          success: false,
          message: 'This email is already registered. Please use a different email.'
        };
      }
    }

    // Create auth user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email || `${normalizedPhone}@temp.technirvor.com`, // Temporary email if not provided
      password: userData.password,
      phone: `+${normalizedPhone}`,
      email_confirm: !userData.email, // Auto-confirm if no email provided
      phone_confirm: false // We'll handle phone verification separately
    });

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError);
      return {
        success: false,
        message: 'Failed to create user account. Please try again.'
      };
    }

    // Create user profile in our users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        full_name: userData.full_name,
        phone: normalizedPhone,
        email: userData.email?.toLowerCase(),
        date_of_birth: userData.date_of_birth,
        gender: userData.gender,
        district: userData.district,
        address: userData.address,
        is_phone_verified: false,
        is_email_verified: !userData.email // Auto-verified if no email
      })
      .select()
      .single();

    if (profileError || !userProfile) {
      console.error('User profile creation error:', profileError);
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        message: 'Failed to create user profile. Please try again.'
      };
    }

    // Handle referral if provided
    if (userData.referral_code) {
      await handleReferral(userProfile.id, userData.referral_code);
    }

    // Send phone verification
    const _verificationResult = await sendPhoneVerification(normalizedPhone);
    
    return {
      success: true,
      message: 'Registration successful! Please verify your phone number.',
      user: userProfile,
      verification_required: true
    };

  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Sends phone verification code
 */
export async function sendPhoneVerification(phone: string): Promise<PhoneVerificationResponse> {
  try {
    const normalizedPhone = normalizeBangladeshiPhone(phone);
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code in database
    const { error } = await supabaseAdmin
      .from('phone_verifications')
      .upsert({
        phone: normalizedPhone,
        verification_code: verificationCode,
        attempts: 0,
        is_verified: false,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'phone'
      });

    if (error) {
      console.error('Verification code storage error:', error);
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.'
      };
    }

    // TODO: Integrate with SMS service (e.g., Twilio, AWS SNS, or local SMS gateway)
    // For now, we'll log the code (remove in production)
    console.log(`Verification code for ${normalizedPhone}: ${verificationCode}`);

    return {
      success: true,
      message: 'Verification code sent successfully.',
      verification_sent: true
    };

  } catch (error) {
    console.error('Phone verification error:', error);
    return {
      success: false,
      message: 'Failed to send verification code. Please try again.'
    };
  }
}

/**
 * Verifies phone number with code
 */
export async function verifyPhoneNumber(data: PhoneVerificationData): Promise<PhoneVerificationResponse> {
  try {
    const normalizedPhone = normalizeBangladeshiPhone(data.phone);

    // Get verification record
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from('phone_verifications')
      .select('*')
      .eq('phone', normalizedPhone)
      .single();

    if (fetchError || !verification) {
      return {
        success: false,
        message: 'Verification code not found. Please request a new code.'
      };
    }

    // Check if code is expired
    if (new Date() > new Date(verification.expires_at)) {
      return {
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      };
    }

    // Check if too many attempts
    if (verification.attempts >= 3) {
      return {
        success: false,
        message: 'Too many verification attempts. Please request a new code.'
      };
    }

    // Verify code
    if (verification.verification_code !== data.verification_code) {
      // Increment attempts
      await supabaseAdmin
        .from('phone_verifications')
        .update({ attempts: verification.attempts + 1 })
        .eq('phone', normalizedPhone);

      return {
        success: false,
        message: 'Invalid verification code. Please try again.'
      };
    }

    // Mark phone as verified
    const { error: updateError } = await supabaseAdmin
      .from('phone_verifications')
      .update({ is_verified: true })
      .eq('phone', normalizedPhone);

    if (updateError) {
      console.error('Verification update error:', updateError);
      return {
        success: false,
        message: 'Failed to verify phone number. Please try again.'
      };
    }

    // Update user profile
    await supabaseAdmin
      .from('users')
      .update({ is_phone_verified: true })
      .eq('phone', normalizedPhone);

    return {
      success: true,
      message: 'Phone number verified successfully!'
    };

  } catch (error) {
    console.error('Phone verification error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Logs in a user with phone and password
 */
export async function loginUser(data: LoginData): Promise<LoginResponse> {
  try {
    const normalizedPhone = normalizeBangladeshiPhone(data.phone);

    // Get user by phone
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', normalizedPhone)
      .single();

    if (userError || !user) {
      return {
        success: false,
        message: 'Phone number not registered. Please sign up first.'
      };
    }

    if (!user.is_active) {
      return {
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      };
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: user.email || `${normalizedPhone}@temp.technirvor.com`,
      password: data.password
    });

    if (authError || !authData.user) {
      return {
        success: false,
        message: 'Invalid password. Please try again.'
      };
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return {
      success: true,
      message: 'Login successful!',
      user: user,
      session_token: authData.session?.access_token
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Gets user profile with rewards data
 */
export async function getUserProfile(userId: string): Promise<UserProfileResponse> {
  try {
    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        success: false
      };
    }

    // Get rewards data
    const { data: rewards } = await supabaseAdmin
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get recent transactions
    const { data: transactions } = await supabaseAdmin
      .from('reward_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const dashboardData: UserDashboardData = {
      user,
      rewards: rewards || {
        id: '',
        user_id: userId,
        total_points: 0,
        available_points: 0,
        total_earned: 0,
        total_redeemed: 0,
        lifetime_points: 0,
        current_tier: 'bronze',
        tier_progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      currentTier: {
        id: '',
        tier_name: 'bronze',
        min_points: 0,
        benefits: {},
        discount_percentage: 0,
        created_at: new Date().toISOString()
      },
      recent_orders: [],
      recent_transactions: transactions || [],
      referral_stats: {
        total_referrals: 0,
        successful_referrals: 0,
        pending_referrals: 0,
        total_earned_points: 0
      },
      referrals: [],
      orderStats: {
        total_orders: 0,
        total_spent: 0
      },
      tier_benefits: {
        id: '',
        tier_name: 'bronze',
        min_points: 0,
        benefits: {},
        discount_percentage: 0,
        created_at: new Date().toISOString()
      }
    };

    return {
      success: true,
      data: dashboardData
    };

  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      success: false
    };
  }
}

/**
 * Handles referral when user registers with a referral code
 */
async function handleReferral(newUserId: string, referralCode: string): Promise<void> {
  try {
    // Find the referrer
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('user_referrals')
      .select('referrer_id')
      .eq('referral_code', referralCode)
      .eq('status', 'pending')
      .single();

    if (referralError || !referral) {
      console.log('Invalid or expired referral code:', referralCode);
      return;
    }

    // Update referral status
    await supabaseAdmin
      .from('user_referrals')
      .update({
        referred_id: newUserId,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('referral_code', referralCode);

    // Award points to referrer
    await supabaseAdmin.rpc('add_reward_points', {
      p_user_id: referral.referrer_id,
      p_points: 100,
      p_description: 'Referral bonus - friend joined'
    });

    // Award welcome bonus to new user
    await supabaseAdmin.rpc('add_reward_points', {
      p_user_id: newUserId,
      p_points: 50,
      p_description: 'Welcome bonus - joined via referral'
    });

  } catch (error) {
    console.error('Referral handling error:', error);
  }
}

/**
 * Generates a unique referral code for a user
 */
export async function generateUserReferralCode(userId: string): Promise<string | null> {
  try {
    // Check if user already has a referral code
    const { data: existingReferral } = await supabaseAdmin
      .from('user_referrals')
      .select('referral_code')
      .eq('referrer_id', userId)
      .single();

    if (existingReferral) {
      return existingReferral.referral_code;
    }

    // Generate new referral code
    const { data, error } = await supabaseAdmin.rpc('generate_referral_code');

    if (error || !data) {
      console.error('Referral code generation error:', error);
      return null;
    }

    // Create referral record
    await supabaseAdmin
      .from('user_referrals')
      .insert({
        referrer_id: userId,
        referral_code: data,
        status: 'pending'
      });

    return data;

  } catch (error) {
    console.error('Generate referral code error:', error);
    return null;
  }
}

/**
 * Checks if a phone number is available for registration
 */
export async function checkPhoneAvailability(phone: string): Promise<{ available: boolean; message?: string }> {
  try {
    const normalizedPhone = normalizeBangladeshiPhone(phone);
    
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .single();

    return {
      available: !existingUser,
      message: existingUser ? 'This phone number is already registered' : 'Phone number is available'
    };

  } catch (error) {
    console.error('Check phone availability error:', error);
    return {
      available: false,
      message: 'Unable to check phone availability'
    };
  }
}