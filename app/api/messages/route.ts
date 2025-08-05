import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GetMessagesResponse, SendMessageResponse } from '@/lib/types/user';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get messages for a conversation
export async function GET(request: NextRequest): Promise<NextResponse<GetMessagesResponse>> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required'
      }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);
    const { searchParams } = new URL(request.url);
    const conversation_id = searchParams.get('conversation_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversation_id) {
      return NextResponse.json({
        success: false,
        message: 'Conversation ID is required'
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

    // Check if user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .or(`user_id.eq.${session.user_id},admin_id.eq.${session.user_id}`)
      .single();

    if (!conversation) {
      return NextResponse.json({
        success: false,
        message: 'Conversation not found or access denied'
      }, { status: 404 });
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, full_name, email),
        admin_sender:admin_users!messages_admin_sender_id_fkey(id, name, email)
      `)
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch messages'
      }, { status: 500 });
    }

    // Mark messages as read for the current user
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversation_id)
      .neq('sender_id', session.user_id)
      .eq('is_read', false);

    return NextResponse.json({
      success: true,
      data: messages || [],
      conversation
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Send a message
export async function POST(request: NextRequest): Promise<NextResponse<SendMessageResponse>> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization token required'
      }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);
    const { conversation_id, recipient_id, content, message_type = 'text' } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'Message content is required'
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

    let conversationId = conversation_id;

    // If no conversation_id provided, create or find existing conversation
    if (!conversationId && recipient_id) {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user_id.eq.${session.user_id},admin_id.eq.${recipient_id}),and(user_id.eq.${recipient_id},admin_id.eq.${session.user_id})`)
        .single();

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: session.user_id,
            admin_id: recipient_id,
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (convError || !newConversation) {
          console.error('Error creating conversation:', convError);
          return NextResponse.json({
            success: false,
            message: 'Failed to create conversation'
          }, { status: 500 });
        }

        conversationId = newConversation.id;
      }
    }

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        message: 'Conversation ID or recipient ID is required'
      }, { status: 400 });
    }

    // Check if user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .or(`user_id.eq.${session.user_id},admin_id.eq.${session.user_id}`)
      .single();

    if (!conversation) {
      return NextResponse.json({
        success: false,
        message: 'Conversation not found or access denied'
      }, { status: 404 });
    }

    // Send message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.user_id,
        content: content.trim(),
        message_type,
        is_read: false
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to send message'
      }, { status: 500 });
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Send notification to recipient
    const recipientId = conversation.user_id === session.user_id ? conversation.admin_id : conversation.user_id;
    if (recipientId) {
      await supabase
        .from('user_notifications')
        .insert({
          user_id: recipientId,
          title: 'New Message',
          message: `You have a new message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          type: 'message',
          data: { conversation_id: conversationId, message_id: message.id }
        });
    }

    return NextResponse.json({
      success: true,
      data: message,
      conversation_id: conversationId
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}