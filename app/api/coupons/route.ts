import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GetCouponsResponse, ApplyCouponData, ApplyCouponResponse } from '@/lib/types/user';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get user's coupons
export async function GET(request: NextRequest): Promise<NextResponse<GetCouponsResponse>> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required'
      }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);

    // Validate session and get user
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      }, { status: 401 });
    }

    // Get user's coupons
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', session.user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch coupons'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: coupons || []
    });

  } catch (error) {
    console.error('Get coupons error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Apply coupon to order
export async function POST(request: NextRequest): Promise<NextResponse<ApplyCouponResponse>> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required'
      }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);
    const body: ApplyCouponData = await request.json();
    const { coupon_code, order_total } = body;

    if (!coupon_code || !order_total) {
      return NextResponse.json({
        success: false,
        message: 'Coupon code and order total are required'
      }, { status: 400 });
    }

    // Validate session and get user
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      }, { status: 401 });
    }

    // Get coupon details
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code.toUpperCase())
      .eq('user_id', session.user_id)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json({
        success: false,
        message: 'Invalid coupon code'
      }, { status: 400 });
    }

    // Check if coupon is already used
    if (coupon.is_used) {
      return NextResponse.json({
        success: false,
        message: 'This coupon has already been used'
      }, { status: 400 });
    }

    // Check if coupon is expired
    if (new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        message: 'This coupon has expired'
      }, { status: 400 });
    }

    // Check minimum order amount
    if (order_total < coupon.minimum_order_amount) {
      return NextResponse.json({
        success: false,
        message: `Minimum order amount is ৳${coupon.minimum_order_amount}`
      }, { status: 400 });
    }

    // Calculate discount
    let discount_amount = 0;
    if (coupon.discount_type === 'percentage') {
      discount_amount = (order_total * coupon.discount_value) / 100;
    } else {
      discount_amount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed order total
    discount_amount = Math.min(discount_amount, order_total);
    const final_total = order_total - discount_amount;

    return NextResponse.json({
      success: true,
      data: {
        discount_amount,
        final_total,
        coupon
      }
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Mark coupon as used (called during order completion)
export async function PUT(request: NextRequest): Promise<NextResponse<{ success: boolean; message?: string }>> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required'
      }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);
    const { coupon_code } = await request.json();

    if (!coupon_code) {
      return NextResponse.json({
        success: false,
        message: 'Coupon code is required'
      }, { status: 400 });
    }

    // Validate session and get user
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      }, { status: 401 });
    }

    // Mark coupon as used
    const { error } = await supabase
      .from('coupons')
      .update({
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('code', coupon_code.toUpperCase())
      .eq('user_id', session.user_id)
      .eq('is_used', false);

    if (error) {
      console.error('Error marking coupon as used:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to use coupon'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon used successfully'
    });

  } catch (error) {
    console.error('Use coupon error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}