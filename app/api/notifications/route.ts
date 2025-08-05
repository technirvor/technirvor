import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GetNotificationsResponse } from "@/lib/types/user";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get user's notifications
export async function GET(
  request: NextRequest,
): Promise<NextResponse<GetNotificationsResponse>> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 },
      );
    }

    const sessionToken = authHeader.substring(7);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unread_only = searchParams.get("unread_only") === "true";

    // Validate session and get user
    const { data: session } = await supabase
      .from("user_sessions")
      .select("user_id")
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 },
      );
    }

    // Build query
    let query = supabase
      .from("user_notifications")
      .select("*")
      .eq("user_id", session.user_id);

    if (unread_only) {
      query = query.eq("is_read", false);
    }

    // Get notifications with pagination
    const { data: notifications, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch notifications",
        },
        { status: 500 },
      );
    }

    // Get unread count
    const { count: unread_count } = await supabase
      .from("user_notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user_id)
      .eq("is_read", false);

    return NextResponse.json({
      success: true,
      data: notifications || [],
      unread_count: unread_count || 0,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Mark notification as read
export async function PUT(
  request: NextRequest,
): Promise<NextResponse<{ success: boolean; message?: string }>> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 },
      );
    }

    const sessionToken = authHeader.substring(7);
    const { notification_id, mark_all_read } = await request.json();

    // Validate session and get user
    const { data: session } = await supabase
      .from("user_sessions")
      .select("user_id")
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 },
      );
    }

    if (mark_all_read) {
      // Mark all notifications as read
      const { error } = await supabase
        .from("user_notifications")
        .update({ is_read: true })
        .eq("user_id", session.user_id)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to mark notifications as read",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    } else if (notification_id) {
      // Mark specific notification as read
      const { error } = await supabase
        .from("user_notifications")
        .update({ is_read: true })
        .eq("id", notification_id)
        .eq("user_id", session.user_id);

      if (error) {
        console.error("Error marking notification as read:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to mark notification as read",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "notification_id or mark_all_read is required",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Delete notification
export async function DELETE(
  request: NextRequest,
): Promise<NextResponse<{ success: boolean; message?: string }>> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 },
      );
    }

    const sessionToken = authHeader.substring(7);
    const { searchParams } = new URL(request.url);
    const notification_id = searchParams.get("id");

    if (!notification_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID is required",
        },
        { status: 400 },
      );
    }

    // Validate session and get user
    const { data: session } = await supabase
      .from("user_sessions")
      .select("user_id")
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 },
      );
    }

    // Delete notification
    const { error } = await supabase
      .from("user_notifications")
      .delete()
      .eq("id", notification_id)
      .eq("user_id", session.user_id);

    if (error) {
      console.error("Error deleting notification:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete notification",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
