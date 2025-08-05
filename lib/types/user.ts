// User registration and reward system types

export interface User {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  district?: string;
  address?: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  profile_image_url?: string;
  registration_date: string;
  last_login?: string;
  is_active: boolean;
  referral_code: string;
  created_at: string;
  updated_at: string;
}

export interface UserRewards {
  id: string;
  user_id: string;
  total_points: number;
  available_points: number;
  total_earned: number;
  total_redeemed: number;
  lifetime_points: number;
  current_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tier_progress: number;
  next_tier_threshold?: number;
  created_at: string;
  updated_at: string;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  order_id?: string;
  expires_at?: string;
  created_at: string;
}

export interface RewardTier {
  id: string;
  tier_name: string;
  min_points: number;
  max_points?: number;
  benefits: Record<string, any>;
  discount_percentage: number;
  free_delivery_threshold?: number;
  created_at: string;
}

export interface UserReferral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  reward_points: number;
  completed_at?: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
}

export interface PhoneVerification {
  id: string;
  phone: string;
  verification_code: string;
  attempts: number;
  is_verified: boolean;
  expires_at: string;
  created_at: string;
}

// Registration form types
export interface UserRegistrationData {
  full_name: string;
  phone: string;
  email?: string;
  password: string;
  confirm_password: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  district?: string;
  address?: string;
  referral_code?: string;
  agree_to_terms: boolean;
}

export interface PhoneVerificationData {
  phone: string;
  verification_code: string;
}

export interface LoginData {
  phone: string;
  password: string;
  remember_me?: boolean;
}

// API response types
export interface UserRegistrationResponse {
  success: boolean;
  message: string;
  user?: User;
  verification_required?: boolean;
}

export interface PhoneVerificationResponse {
  success: boolean;
  message: string;
  verification_sent?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  session_token?: string;
}

export interface UserProfileResponse {
  success: boolean;
  data?: UserDashboardData;
  message?: string;
  error?: string;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface BangladeshiPhoneValidation extends ValidationResult {
  normalized_phone?: string;
  operator?: 'Grameenphone' | 'Robi' | 'Banglalink' | 'Teletalk' | 'Airtel';
}

// User dashboard types
export interface UserDashboardData {
  user: User;
  rewards: UserRewards;
  currentTier: RewardTier;
  nextTier?: RewardTier;
  recent_orders: any[]; // Will use existing Order type
  recent_transactions: RewardTransaction[];
  referral_stats: {
    total_referrals: number;
    successful_referrals: number;
    pending_referrals: number;
    total_earned_points: number;
  };
  referrals: UserReferral[];
  orderStats: {
    total_orders: number;
    total_spent: number;
    last_order_date?: string;
  };
  tier_benefits: RewardTier;
}

// Reward redemption types
export interface RewardRedemption {
  points_to_redeem: number;
  redemption_type: 'discount' | 'free_delivery' | 'gift_voucher';
  description: string;
  minimum_order_amount?: number;
}

export interface RedemptionResponse {
  success: boolean;
  message: string;
  remaining_points?: number;
  discount_code?: string;
}

// User preferences
export interface UserPreferences {
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    marketing_emails: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private';
    show_purchase_history: boolean;
  };
  language: 'en' | 'bn';
  currency: 'BDT';
}

// Form validation schemas (for use with react-hook-form)
export interface RegistrationFormErrors {
  full_name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  date_of_birth?: string;
  district?: string;
  referral_code?: string;
  agree_to_terms?: string;
}

export interface LoginFormErrors {
  phone?: string;
  password?: string;
}

export interface PhoneVerificationErrors {
  phone?: string;
  verification_code?: string;
}

// Constants
export const BANGLADESHI_OPERATORS = {
  GRAMEENPHONE: { prefix: ['017', '013'], name: 'Grameenphone' },
  ROBI: { prefix: ['018', '019'], name: 'Robi' },
  BANGLALINK: { prefix: ['014', '019'], name: 'Banglalink' },
  TELETALK: { prefix: ['015'], name: 'Teletalk' },
  AIRTEL: { prefix: ['016'], name: 'Airtel' }
} as const;

export const REWARD_TIERS = {
  BRONZE: { name: 'bronze', min_points: 0, max_points: 999 },
  SILVER: { name: 'silver', min_points: 1000, max_points: 4999 },
  GOLD: { name: 'gold', min_points: 5000, max_points: 19999 },
  PLATINUM: { name: 'platinum', min_points: 20000, max_points: null }
} as const;

export const POINTS_PER_BDT = 0.1; // 1 point for every 10 BDT
export const WELCOME_BONUS_POINTS = 50;
export const REFERRAL_BONUS_POINTS = 100;
export const BIRTHDAY_BONUS_POINTS = {
  bronze: 100,
  silver: 200,
  gold: 300,
  platinum: 500
} as const;

// Coupon system types
export interface Coupon {
  id: string;
  code: string;
  user_id: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  is_used: boolean;
  used_at?: string;
  expires_at: string;
  created_at: string;
}

// User notifications types
export interface UserNotification {
  id: string;
  user_id: string;
  type: 'order' | 'offer' | 'status' | 'message' | 'coupon' | 'reward';
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// Messaging system types
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type: 'text' | 'image' | 'file';
  attachment_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_id?: string;
  last_message_at: string;
  created_at: string;
  last_message?: Message;
  other_participant?: User;
  unread_count?: number;
}

export interface AdminUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
}

// API request/response types for new features
export interface SendMessageData {
  receiver_id: string;
  message: string;
  message_type?: 'text' | 'image' | 'file';
  attachment_url?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: string;
  data?: {
    message_id: string;
    conversation_id: string;
  };
}

export interface GetConversationsResponse {
  success: boolean;
  data?: Conversation[];
  message?: string;
}

export interface GetMessagesResponse {
  success: boolean;
  data?: Message[];
  message?: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  data?: UserNotification[];
  unread_count?: number;
  message?: string;
}

export interface GetCouponsResponse {
  success: boolean;
  data?: Coupon[];
  message?: string;
}

export interface ApplyCouponData {
  coupon_code: string;
  order_total: number;
}

export interface ApplyCouponResponse {
  success: boolean;
  data?: {
    discount_amount: number;
    final_total: number;
    coupon: Coupon;
  };
  message?: string;
}

// Real-time notification types
export interface NotificationPayload {
  type: 'order' | 'offer' | 'status' | 'message' | 'coupon' | 'reward';
  title: string;
  message: string;
  data?: Record<string, any>;
  user_id: string;
}

export interface MessagePayload {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
}