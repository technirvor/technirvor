import { supabase } from "./supabase";

export interface AdminNotification {
  id: string;
  type: "new_order" | "order_update" | "low_stock" | "system";
  title: string;
  message: string;
  order_id?: string;
  is_read: boolean;
  created_at: string;
  // updated_at removed to match Supabase schema
}

export class NotificationService {
  private audioContext: AudioContext | null = null;
  private isAudioEnabled = true;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      if (typeof window !== "undefined") {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        // Handle suspended audio context
        if (this.audioContext.state === "suspended") {
          document.addEventListener(
            "click",
            () => {
              this.audioContext?.resume();
            },
            { once: true },
          );
        }
      }
    } catch (error) {
      console.warn("Audio context not supported:", error);
      this.isAudioEnabled = false;
    }
  }

  private playNotificationSound() {
    if (!this.isAudioEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Create a pleasant notification beep
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        600,
        this.audioContext.currentTime + 0.1,
      );

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.3,
        this.audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.3,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn("Failed to play notification sound:", error);
    }
  }

  async getNotifications(limit = 50): Promise<AdminNotification[]> {
    try {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc(
        "get_unread_notification_count",
      );

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("is_read", false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }

  subscribeToNotifications(
    callback: (notification: AdminNotification) => void,
  ) {
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          const notification = payload.new as AdminNotification;
          this.playNotificationSound();
          callback(notification);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async createNotification(
    type: AdminNotification["type"],
    title: string,
    message: string,
    orderId?: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("notify_all_admins", {
        p_type: type,
        p_title: title,
        p_message: message,
        p_order_id: orderId || null,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating notification:", error);
      return false;
    }
  }

  async notifyNewOrder(
    orderId: string,
    customerName: string,
    totalAmount: number,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("notify_new_order", {
        p_order_id: orderId,
        p_customer_name: customerName,
        p_total_amount: totalAmount,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending new order notification:", error);
      return false;
    }
  }

  async notifyLowStock(
    productName: string,
    currentStock: number,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("notify_low_stock", {
        p_product_name: productName,
        p_current_stock: currentStock,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending low stock notification:", error);
      return false;
    }
  }

  formatTimeAgo(date: string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - notificationDate.getTime()) / 1000,
    );

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  }

  getNotificationIcon(type: AdminNotification["type"]): string {
    switch (type) {
      case "new_order":
        return "🛒";
      case "order_update":
        return "📦";
      case "low_stock":
        return "⚠️";
      case "system":
        return "ℹ️";
      default:
        return "🔔";
    }
  }

  getNotificationColor(type: AdminNotification["type"]): string {
    switch (type) {
      case "new_order":
        return "text-green-600";
      case "order_update":
        return "text-blue-600";
      case "low_stock":
        return "text-orange-600";
      case "system":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  }
}

export const notificationService = new NotificationService();
