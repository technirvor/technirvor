import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LoginData, LoginResponse } from '@/lib/types/user';
import { normalizeBangladeshiPhone } from '@/lib/utils/phone-validation';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();

    if (!body.phone || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Phone number and password are required' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeBangladeshiPhone(body.phone);

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      phone: normalizedPhone,
      password: body.password
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!userProfile.is_active) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Check if phone is verified
    if (!userProfile.phone_verified) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Phone number not verified. Please verify your phone number first.',
          verification_required: true
        },
        { status: 403 }
      );
    }

    // Update last login
    await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userProfile.id);

    // Generate session token (simple approach)
    const sessionToken = `tn_${userProfile.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store session in database
    const sessionExpiry = body.remember_me 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userProfile.id,
        session_token: sessionToken,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        expires_at: sessionExpiry.toISOString()
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      // Continue anyway, session storage is not critical for login
    }

    // Clean up old sessions (keep only last 5 sessions per user)
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userProfile.id)
      .lt('created_at', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString());

    const response: LoginResponse = {
      success: true,
      message: 'Login successful',
      user: {
        id: userProfile.id,
        auth_user_id: userProfile.auth_user_id,
        full_name: userProfile.full_name,
        phone: userProfile.phone,
        email: userProfile.email,
        date_of_birth: userProfile.date_of_birth,
        gender: userProfile.gender,
        district: userProfile.district,
        address: userProfile.address,
        is_phone_verified: userProfile.phone_verified,
        is_email_verified: userProfile.email_verified,
        profile_image_url: userProfile.profile_image_url,
        registration_date: userProfile.created_at,
        last_login: new Date().toISOString(),
        is_active: userProfile.is_active,
        referral_code: userProfile.referral_code,
        created_at: userProfile.created_at,
        updated_at: new Date().toISOString()
      },
      session_token: sessionToken
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}