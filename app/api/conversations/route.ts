import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GetConversationsResponse } from "@/lib/types/user";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get user's conversations
export async function GET(
  request: NextRequest,
): Promise<NextResponse<GetConversationsResponse>> {
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

    // Get conversations with last message and unread count
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        user:users!conversations_user_id_fkey(id, full_name, email),
        admin:admin_users!conversations_admin_id_fkey(id, name, email),
        last_message:messages!conversations_last_message_id_fkey(id, content, created_at, sender_id, admin_sender_id)
      `,
      )
      .or(`user_id.eq.${session.user_id},admin_id.eq.${session.user_id}`)
      .order("last_message_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("Error fetching conversations:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch conversations",
        },
        { status: 500 },
      );
    }

    // Get unread message counts for each conversation
    const conversationsWithUnread = await Promise.all(
      (conversations || []).map(async (conversation) => {
        const { count: unread_count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conversation.id)
          .neq("sender_id", session.user_id)
          .eq("is_read", false);

        return {
          ...conversation,
          unread_count: unread_count || 0,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: conversationsWithUnread,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Create a new conversation
export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ success: boolean; data?: any; message?: string }>> {
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
    const { recipient_id, initial_message } = await request.json();

    if (!recipient_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipient ID is required",
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

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user_id.eq.${session.user_id},admin_id.eq.${recipient_id}),and(user_id.eq.${recipient_id},admin_id.eq.${session.user_id})`,
      )
      .single();

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        data: { conversation_id: existingConversation.id },
        message: "Conversation already exists",
      });
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        user_id: session.user_id,
        admin_id: recipient_id,
        last_message_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create conversation",
        },
        { status: 500 },
      );
    }

    // Send initial message if provided
    if (initial_message && initial_message.trim() !== "") {
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: session.user_id,
        content: initial_message.trim(),
        message_type: "text",
        is_read: false,
      });

      if (messageError) {
        console.error("Error sending initial message:", messageError);
      }

      // Send notification to recipient
      await supabase.from("user_notifications").insert({
        user_id: recipient_id,
        title: "New Conversation",
        message: `You have a new message: ${initial_message.substring(0, 50)}${initial_message.length > 50 ? "..." : ""}`,
        type: "message",
        data: { conversation_id: conversation.id },
      });
    }

    return NextResponse.json({
      success: true,
      data: conversation,
      message: "Conversation created successfully",
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Delete a conversation
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
    const conversation_id = searchParams.get("id");

    if (!conversation_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation ID is required",
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

    // Check if user owns the conversation
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .or(`user_id.eq.${session.user_id},admin_id.eq.${session.user_id}`)
      .single();

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation not found or access denied",
        },
        { status: 404 },
      );
    }

    // Delete all messages in the conversation first
    await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversation_id);

    // Delete the conversation
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversation_id);

    if (error) {
      console.error("Error deleting conversation:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete conversation",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
