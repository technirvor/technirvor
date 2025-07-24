import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api-security';

// Use validateRequest for admin access
async function validateAdminAccess(request: NextRequest) {
  return validateRequest(request, { requireAdmin: true });
}

// This is a demo endpoint for sending browser notifications to users who have granted permission.
// In production, you should use a push service (like Firebase Cloud Messaging) for real push notifications.

export async function POST(request: NextRequest) {
  const { isValid, error } = await validateAdminAccess(request);
  if (!isValid) {
    return NextResponse.json({ success: false, error }, { status: 401 });
  }
  try {
    const { title, body, icon } = await request.json();
    // This endpoint only triggers a notification if called from the browser with Notification permission
    // It does NOT send push notifications to users who are not on the site or have not granted permission
    // For real push, integrate with a push service and use Service Workers
    return NextResponse.json({
      success: true,
      message: 'Notification request received. Use Notification API on client to show notification.',
      data: { title, body, icon },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 400 });
  }
}
