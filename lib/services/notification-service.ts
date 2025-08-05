import { createClient } from '@supabase/supabase-js';
import { GetNotificationsResponse, NotificationPayload } from '@/lib/types/user';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get user's notifications
 */
export async function getUserNotifications(
  sessionToken: string,
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<GetNotificationsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unread_only: unreadOnly.toString()
    });

    const response = await fetch(`/api/notifications?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get user notifications error:', error);
    return {
      success: false,
      message: 'Failed to fetch notifications'
    };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  sessionToken: string,
  notificationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notification_id: notificationId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return {
      success: false,
      message: 'Failed to mark notification as read'
    };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(
  sessionToken: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mark_all_read: true })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return {
      success: false,
      message: 'Failed to mark all notifications as read'
    };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  sessionToken: string,
  notificationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`/api/notifications?id=${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete notification error:', error);
    return {
      success: false,
      message: 'Failed to delete notification'
    };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(
  sessionToken: string
): Promise<{ success: boolean; count?: number; message?: string }> {
  try {
    const response = await getUserNotifications(sessionToken, 1, 1, true);
    if (response.success) {
      return {
        success: true,
        count: response.unread_count || 0
      };
    }
    return response;
  } catch (error) {
    console.error('Get unread notification count error:', error);
    return {
      success: false,
      message: 'Failed to get unread notification count'
    };
  }
}

/**
 * Send notification to user (server-side function)
 */
export async function sendNotificationToUser(
  userId: string,
  notification: NotificationPayload
): Promise<{ success: boolean; message?: string }> {
  try {
    const { data: _, error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        is_read: false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        message: 'Failed to send notification'
      };
    }

    return {
      success: true,
      message: 'Notification sent successfully'
    };
  } catch (error) {
    console.error('Send notification error:', error);
    return {
      success: false,
      message: 'Failed to send notification'
    };
  }
}

/**
 * Send bulk notifications to multiple users
 */
export async function sendBulkNotifications(
  userIds: string[],
  notification: Omit<NotificationPayload, 'user_id'>
): Promise<{ success: boolean; message?: string; sent_count?: number }> {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      is_read: false
    }));

    const { data, error } = await supabase
      .from('user_notifications')
      .insert(notifications)
      .select('id');

    if (error) {
      console.error('Error sending bulk notifications:', error);
      return {
        success: false,
        message: 'Failed to send bulk notifications'
      };
    }

    return {
      success: true,
      message: 'Bulk notifications sent successfully',
      sent_count: data?.length || 0
    };
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    return {
      success: false,
      message: 'Failed to send bulk notifications'
    };
  }
}

/**
 * Create notification for order status updates
 */
export async function createOrderNotification(
  userId: string,
  orderId: string,
  status: string,
  orderTotal?: number
): Promise<{ success: boolean; message?: string }> {
  const statusMessages = {
    'pending': 'Your order has been received and is being processed.',
    'confirmed': 'Your order has been confirmed and will be prepared soon.',
    'preparing': 'Your order is being prepared.',
    'ready': 'Your order is ready for pickup/delivery.',
    'out_for_delivery': 'Your order is out for delivery.',
    'delivered': 'Your order has been delivered successfully.',
    'cancelled': 'Your order has been cancelled.',
    'refunded': 'Your order has been refunded.'
  };

  const title = `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  const message = statusMessages[status as keyof typeof statusMessages] || `Your order status has been updated to ${status}.`;

  return await sendNotificationToUser(userId, {
    type: 'order',
    title,
    message,
    data: {
      order_id: orderId,
      status,
      order_total: orderTotal
    },
    user_id: userId
  });
}

/**
 * Create notification for new offers
 */
export async function createOfferNotification(
  userId: string,
  offerTitle: string,
  offerDescription: string,
  offerId?: string
): Promise<{ success: boolean; message?: string }> {
  return await sendNotificationToUser(userId, {
    type: 'offer',
    title: offerTitle,
    message: offerDescription,
    data: {
      offer_id: offerId
    },
    user_id: userId
  });
}

/**
 * Create notification for new coupons
 */
export async function createCouponNotification(
  userId: string,
  couponCode: string,
  discountValue: number,
  discountType: 'percentage' | 'fixed'
): Promise<{ success: boolean; message?: string }> {
  const discountText = discountType === 'percentage' 
    ? `${discountValue}% off` 
    : `৳${discountValue} off`;

  return await sendNotificationToUser(userId, {
    type: 'coupon',
    title: 'Welcome Coupon Received!',
    message: `You've received a welcome coupon: ${couponCode} for ${discountText}. Valid for 72 hours!`,
    data: {
      coupon_code: couponCode,
      discount_value: discountValue,
      discount_type: discountType
    },
    user_id: userId
  });
}