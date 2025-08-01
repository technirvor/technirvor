import {
  FacebookAdsApi,
  ServerEvent,
  UserData,
  EventRequest,
  CustomData,
} from "facebook-nodejs-business-sdk";
import { NextRequest } from "next/server";
import crypto from "crypto";

// Types for better type safety
export interface MetaEventData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  num_items?: number;
  order_id?: string;
  search_string?: string;
  custom_data?: Record<string, any>;
}

export interface MetaUserInfo {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  fbc?: string;
  fbp?: string;
  userAgent?: string;
  clientIpAddress?: string;
}

export type MetaEventName = 
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'Schedule'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe';

// Configuration - Use server-side only environment variables for security
const accessToken = process.env.META_CAPI_ACCESS_TOKEN || process.env.NEXT_PUBLIC_META_CAPI_ACCESS_TOKEN;
const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const testEventCode = process.env.META_CAPI_TEST_CODE || process.env.NEXT_PUBLIC_META_CAPI_TEST_CODE;

// Initialize Facebook Ads API
let isInitialized = false;

const initializeMetaAPI = (): boolean => {
  if (isInitialized) return true;
  
  if (!accessToken || !pixelId) {
    console.warn('Meta CAPI credentials not configured. Please set META_CAPI_ACCESS_TOKEN and META_PIXEL_ID environment variables.');
    return false;
  }

  try {
    FacebookAdsApi.init(accessToken);
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize Meta API:', error);
    return false;
  }
};

// Utility functions
const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
};

const extractUserDataFromRequest = (request?: NextRequest): Partial<MetaUserInfo> => {
  if (!request) return {};
  
  const userAgent = request.headers.get('user-agent') || undefined;
  const clientIpAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                         request.headers.get('x-real-ip') || 
                         undefined;
  
  return {
    userAgent,
    clientIpAddress,
  };
};

const createUserData = (userInfo: MetaUserInfo): UserData => {
  const userData = new UserData();
  
  if (userInfo.email) {
    userData.setEmail(hashData(userInfo.email));
  }
  if (userInfo.phone) {
    userData.setPhone(hashData(userInfo.phone));
  }
  if (userInfo.firstName) {
    userData.setFirstName(hashData(userInfo.firstName));
  }
  if (userInfo.lastName) {
    userData.setLastName(hashData(userInfo.lastName));
  }
  if (userInfo.city) {
    userData.setCity(hashData(userInfo.city));
  }
  if (userInfo.state) {
    userData.setState(hashData(userInfo.state));
  }
  if (userInfo.country) {
    userData.setCountry(hashData(userInfo.country));
  }
  if (userInfo.zipCode) {
    userData.setZip(hashData(userInfo.zipCode));
  }
  if (userInfo.fbc) {
    userData.setFbc(userInfo.fbc);
  }
  if (userInfo.fbp) {
    userData.setFbp(userInfo.fbp);
  }
  if (userInfo.userAgent) {
    userData.setClientUserAgent(userInfo.userAgent);
  }
  if (userInfo.clientIpAddress) {
    userData.setClientIpAddress(userInfo.clientIpAddress);
  }
  
  return userData;
};

const createCustomData = (eventData: MetaEventData): CustomData => {
  const customData = new CustomData();
  
  if (eventData.value !== undefined) {
    customData.setValue(eventData.value);
  }
  if (eventData.currency) {
    customData.setCurrency(eventData.currency);
  }
  if (eventData.content_ids && eventData.content_ids.length > 0) {
    customData.setContentIds(eventData.content_ids);
  }
  if (eventData.content_name) {
    customData.setContentName(eventData.content_name);
  }
  if (eventData.content_type) {
    customData.setContentType(eventData.content_type);
  }
  if (eventData.content_category) {
    customData.setContentCategory(eventData.content_category);
  }
  if (eventData.num_items !== undefined) {
    customData.setNumItems(eventData.num_items);
  }
  if (eventData.order_id) {
    customData.setOrderId(eventData.order_id);
  }
  if (eventData.search_string) {
    customData.setSearchString(eventData.search_string);
  }
  if (eventData.custom_data) {
    customData.setCustomProperties(eventData.custom_data);
  }
  
  return customData;
};

// Main function to send server events
export const sendServerEvent = async (
  eventName: MetaEventName,
  eventData: MetaEventData = {},
  userInfo: MetaUserInfo = {},
  request?: NextRequest
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!initializeMetaAPI()) {
      return { success: false, error: 'Meta API not initialized' };
    }

    // Validate required parameters for ViewContent events
    if (eventName === 'ViewContent' && (!eventData.content_ids || eventData.content_ids.length === 0)) {
      console.warn('ViewContent event missing required content_ids parameter');
      return { success: false, error: 'ViewContent event requires content_ids' };
    }

    // Merge user info from request if available
    const mergedUserInfo = { ...userInfo, ...extractUserDataFromRequest(request) };
    
    const userData = createUserData(mergedUserInfo);
    const customData = createCustomData(eventData);
    
    // Generate a unique event ID to prevent duplicate events
    const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const serverEvent = new ServerEvent()
      .setEventName(eventName)
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventId(eventId)
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(request?.url || 'https://technirvor.com')
      .setActionSource('website');
    
    const eventRequest = new EventRequest(accessToken!, pixelId!)
      .setEvents([serverEvent]);
    
    // Add test event code if in development
    if (testEventCode && process.env.NODE_ENV === 'development') {
      eventRequest.setTestEventCode(testEventCode);
    }
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to send Meta CAPI event '${eventName}':`, {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      eventData,
      userInfo
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Convenience functions for common events
export const trackPageView = async (
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  return sendServerEvent('PageView', {}, userInfo, request);
};

export const trackPurchase = async (
  orderData: {
    value: number;
    currency: string;
    order_id: string;
    content_ids?: string[];
    num_items?: number;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  return sendServerEvent('Purchase', orderData, userInfo, request);
};

export const trackAddToCart = async (
  productData: {
    content_ids: string[];
    content_name?: string;
    content_type?: string;
    value?: number;
    currency?: string;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  return sendServerEvent('AddToCart', productData, userInfo, request);
};

export const trackViewContent = async (
  contentData: {
    content_ids: string[];
    content_name?: string;
    content_type?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  return sendServerEvent('ViewContent', contentData, userInfo, request);
};

export const trackSearch = async (
  searchData: {
    search_string: string;
    content_category?: string;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  return sendServerEvent('Search', searchData, userInfo, request);
};

export const trackLead = async (
  leadData: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  return sendServerEvent('Lead', leadData, userInfo, request);
};

// Utility to check if Meta CAPI is properly configured
export const isMetaConfigured = (): boolean => {
  return !!(accessToken && pixelId);
};

// Export configuration status for debugging
export const getMetaConfig = () => {
  return {
    hasAccessToken: !!accessToken,
    hasPixelId: !!pixelId,
    hasTestEventCode: !!testEventCode,
    isInitialized,
    environment: process.env.NODE_ENV
  };
};
