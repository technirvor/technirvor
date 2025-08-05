import { createClient } from '@supabase/supabase-js';
import { 
  SendMessageResponse, 
  GetConversationsResponse, 
  GetMessagesResponse 
} from '@/lib/types/user';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get user's conversations
 */
export async function getUserConversations(
  sessionToken: string,
  page: number = 1,
  limit: number = 20
): Promise<GetConversationsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`/api/conversations?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get user conversations error:', error);
    return {
      success: false,
      message: 'Failed to fetch conversations'
    };
  }
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  sessionToken: string,
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<GetMessagesResponse> {
  try {
    const params = new URLSearchParams({
      conversation_id: conversationId,
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`/api/messages?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get conversation messages error:', error);
    return {
      success: false,
      message: 'Failed to fetch messages'
    };
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  sessionToken: string,
  conversationId: string,
  content: string,
  messageType: 'text' | 'image' | 'file' = 'text'
): Promise<SendMessageResponse> {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        content,
        message_type: messageType
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Send message error:', error);
    return {
      success: false,
      message: 'Failed to send message'
    };
  }
}

/**
 * Start a new conversation
 */
export async function startConversation(
  sessionToken: string,
  recipientId: string,
  initialMessage?: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient_id: recipientId,
        initial_message: initialMessage
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Start conversation error:', error);
    return {
      success: false,
      message: 'Failed to start conversation'
    };
  }
}

/**
 * Send message to a specific user (creates conversation if needed)
 */
export async function sendMessageToUser(
  sessionToken: string,
  recipientId: string,
  content: string,
  messageType: 'text' | 'image' | 'file' = 'text'
): Promise<SendMessageResponse> {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient_id: recipientId,
        content,
        message_type: messageType
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Send message to user error:', error);
    return {
      success: false,
      message: 'Failed to send message'
    };
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  sessionToken: string,
  conversationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`/api/conversations?id=${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete conversation error:', error);
    return {
      success: false,
      message: 'Failed to delete conversation'
    };
  }
}

/**
 * Get admin users for messaging
 */
export async function getAdminUsers(): Promise<{
  success: boolean;
  data?: any[];
  message?: string;
}> {
  try {
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching admin users:', error);
      return {
        success: false,
        message: 'Failed to fetch admin users'
      };
    }

    return {
      success: true,
      data: admins || []
    };
  } catch (error) {
    console.error('Get admin users error:', error);
    return {
      success: false,
      message: 'Failed to fetch admin users'
    };
  }
}

/**
 * Search users for messaging (for user-to-user messaging)
 */
export async function searchUsers(
  sessionToken: string,
  searchQuery: string,
  limit: number = 10
): Promise<{
  success: boolean;
  data?: any[];
  message?: string;
}> {
  try {
    // Validate session first
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return {
        success: false,
        message: 'Invalid or expired session'
      };
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone')
      .neq('id', session.user_id) // Exclude current user
      .eq('is_active', true)
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching users:', error);
      return {
        success: false,
        message: 'Failed to search users'
      };
    }

    return {
      success: true,
      data: users || []
    };
  } catch (error) {
    console.error('Search users error:', error);
    return {
      success: false,
      message: 'Failed to search users'
    };
  }
}

/**
 * Mark messages as read in a conversation
 */
export async function markMessagesAsRead(
  sessionToken: string,
  conversationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // This is handled automatically in the GET messages API
    // But we can also provide a dedicated endpoint if needed
    const response = await getConversationMessages(sessionToken, conversationId, 1, 1);
    return {
      success: response.success,
      message: response.success ? 'Messages marked as read' : response.message
    };
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return {
      success: false,
      message: 'Failed to mark messages as read'
    };
  }
}

/**
 * Get unread message count across all conversations
 */
export async function getUnreadMessageCount(
  sessionToken: string
): Promise<{ success: boolean; count?: number; message?: string }> {
  try {
    const conversationsResponse = await getUserConversations(sessionToken, 1, 100);
    
    if (!conversationsResponse.success || !conversationsResponse.data) {
      return {
        success: false,
        message: 'Failed to fetch conversations'
      };
    }

    const totalUnread = conversationsResponse.data.reduce(
      (total, conversation) => total + (conversation.unread_count || 0),
      0
    );

    return {
      success: true,
      count: totalUnread
    };
  } catch (error) {
    console.error('Get unread message count error:', error);
    return {
      success: false,
      message: 'Failed to get unread message count'
    };
  }
}