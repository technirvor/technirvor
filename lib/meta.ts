import {
  FacebookAdsApi,
  ServerEvent,
  UserData,
  EventRequest,
  CustomData,
} from "facebook-nodejs-business-sdk";
import { NextRequest } from "next/server";
import { createHash } from "crypto";

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
  // Enhanced Custom Data Parameters
  contents?: Array<{
    id: string;
    quantity?: number;
    item_price?: number;
    delivery_category?: "home_delivery" | "in_store" | "curbside";
  }>;
  content_brand?: string;
  predicted_ltv?: number;
  status?: string;
  delivery_category?: "home_delivery" | "in_store" | "curbside";
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
  // Enhanced User Data Parameters
  dateOfBirth?: string; // YYYYMMDD format
  gender?: "m" | "f";
  externalId?: string;
  subscriptionId?: string;
  leadId?: string;
  // Advanced Matching Parameters
  madid?: string; // Mobile Advertiser ID
  anon_id?: string; // Anonymous ID
  click_id?: string; // Click ID from ad
  browser_id?: string; // Browser ID
}

// Enhanced Server Event Configuration
export interface MetaServerEventConfig {
  event_id?: string;
  opt_out?: boolean;
  data_processing_options?: string[];
  data_processing_options_country?: number;
  data_processing_options_state?: number;
  partner_agent?: string;
  test_event_code?: string;
}

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "AddToWishlist"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "Schedule"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe";

// Configuration - Use server-side only environment variables for security
const accessToken =
  process.env.META_CAPI_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_META_CAPI_ACCESS_TOKEN;
const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const testEventCode =
  process.env.META_CAPI_TEST_CODE ||
  process.env.NEXT_PUBLIC_META_CAPI_TEST_CODE;

// Initialize Facebook Ads API
let isInitialized = false;

const initializeMetaAPI = (): boolean => {
  if (isInitialized) return true;

  if (!accessToken || !pixelId) {
    console.warn(
      "Meta CAPI credentials not configured. Please set META_CAPI_ACCESS_TOKEN and META_PIXEL_ID environment variables.",
    );
    return false;
  }

  try {
    FacebookAdsApi.init(accessToken);
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize Meta API:", error);
    return false;
  }
};

// Utility functions
const hashData = (data: string): string => {
  return createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
};

const extractUserDataFromRequest = (
  request?: NextRequest,
): Partial<MetaUserInfo> => {
  if (!request) return {};

  const userAgent = request.headers.get("user-agent") || undefined;
  const clientIpAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    undefined;

  return {
    userAgent,
    clientIpAddress,
  };
};

const createUserData = (userInfo: MetaUserInfo): UserData => {
  const userData = new UserData();

  // Basic user information (hashed)
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

  // Enhanced user data parameters (hashed)
  if (userInfo.dateOfBirth) {
    userData.setDateOfBirth(hashData(userInfo.dateOfBirth));
  }
  if (userInfo.gender) {
    userData.setGender(hashData(userInfo.gender));
  }
  if (userInfo.externalId) {
    userData.setExternalId(hashData(userInfo.externalId));
  }

  // Advanced matching parameters (hashed)
  if (userInfo.madid) {
    userData.setMadid(hashData(userInfo.madid));
  }

  // Browser and tracking data (not hashed)
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
  // Note: click_id and browser_id may need to be added to custom_data
  // as they might not have direct setter methods in the SDK
  if (userInfo.subscriptionId) {
    userData.setSubscriptionId(userInfo.subscriptionId);
  }
  if (userInfo.leadId) {
    userData.setLeadId(userInfo.leadId);
  }
  if (userInfo.anon_id) {
    userData.setAnonId(userInfo.anon_id);
  }

  return userData;
};

const createCustomData = (eventData: MetaEventData): CustomData => {
  const customData = new CustomData();

  // Basic event data
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

  // Enhanced custom data parameters - add to custom properties
  const customProperties: Record<string, any> = {};

  // Add enhanced parameters to custom properties
  if (eventData.contents && eventData.contents.length > 0) {
    customProperties.contents = eventData.contents;
  }
  if (eventData.content_brand) {
    customProperties.content_brand = eventData.content_brand;
  }
  if (eventData.predicted_ltv !== undefined) {
    customProperties.predicted_ltv = eventData.predicted_ltv;
  }
  if (eventData.status) {
    customProperties.status = eventData.status;
  }
  if (eventData.delivery_category) {
    customProperties.delivery_category = eventData.delivery_category;
  }

  // Add any additional custom data
  if (eventData.custom_data) {
    Object.assign(customProperties, eventData.custom_data);
  }

  // Set custom properties if any exist
  if (Object.keys(customProperties).length > 0) {
    customData.setCustomProperties(customProperties);
  }

  return customData;
};

// Main function to send server events
export const sendServerEvent = async (
  eventName: MetaEventName,
  eventData: MetaEventData = {},
  userInfo: MetaUserInfo = {},
  request?: NextRequest,
  config: MetaServerEventConfig = {},
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!initializeMetaAPI()) {
      return { success: false, error: "Meta API not initialized" };
    }

    // Validate required parameters for ViewContent events
    if (
      eventName === "ViewContent" &&
      (!eventData.content_ids || eventData.content_ids.length === 0)
    ) {
      console.warn("ViewContent event missing required content_ids parameter");
      return {
        success: false,
        error: "ViewContent event requires content_ids",
      };
    }

    // Merge user info from request if available
    const mergedUserInfo = {
      ...userInfo,
      ...extractUserDataFromRequest(request),
    };

    const userData = createUserData(mergedUserInfo);
    const customData = createCustomData(eventData);

    // Generate a unique event ID to prevent duplicate events (use config if provided)
    const eventId =
      config.event_id ||
      `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const serverEvent = new ServerEvent()
      .setEventName(eventName)
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventId(eventId)
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(request?.url || "https://technirvor.com")
      .setActionSource("website");

    // Add opt_out if specified
    if (config.opt_out !== undefined) {
      serverEvent.setOptOut(config.opt_out);
    }

    const eventRequest = new EventRequest(accessToken!, pixelId!).setEvents([
      serverEvent,
    ]);

    // Add test event code (prioritize config, then environment)
    const testCode =
      config.test_event_code ||
      (process.env.NODE_ENV === "development" ? testEventCode : undefined);
    if (testCode) {
      eventRequest.setTestEventCode(testCode);
    }

    // Note: Data processing options may need to be set at the API level
    // or through custom properties depending on SDK version

    // Add partner agent if specified
    if (config.partner_agent) {
      eventRequest.setPartnerAgent(config.partner_agent);
    }

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to send Meta CAPI event '${eventName}':`, {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      eventData,
      userInfo,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Convenience functions for common events
export const trackPageView = async (
  userInfo: MetaUserInfo = {},
  request?: NextRequest,
) => {
  return sendServerEvent("PageView", {}, userInfo, request);
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
  request?: NextRequest,
) => {
  return sendServerEvent("Purchase", orderData, userInfo, request);
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
  request?: NextRequest,
) => {
  return sendServerEvent("AddToCart", productData, userInfo, request);
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
  request?: NextRequest,
) => {
  return sendServerEvent("ViewContent", contentData, userInfo, request);
};

export const trackSearch = async (
  searchData: {
    search_string: string;
    content_category?: string;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest,
) => {
  return sendServerEvent("Search", searchData, userInfo, request);
};

export const trackLead = async (
  leadData: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest,
) => {
  return sendServerEvent("Lead", leadData, userInfo, request);
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
    environment: process.env.NODE_ENV,
  };
};

// Client-side Meta Pixel tracking functions
// These generate the fbq() calls for client-side tracking

/**
 * Generate client-side ViewContent tracking code
 * Based on Meta's standard pixel code for product views
 */
export const generateViewContentPixelCode = (contentData: {
  content_ids: string[];
  content_type?: string;
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}): string => {
  const eventData: Record<string, any> = {
    content_ids: contentData.content_ids,
    content_type: contentData.content_type || "product",
  };

  // Add optional parameters if provided
  if (contentData.content_name)
    eventData.content_name = contentData.content_name;
  if (contentData.content_category)
    eventData.content_category = contentData.content_category;
  if (contentData.value) eventData.value = contentData.value;
  if (contentData.currency) eventData.currency = contentData.currency;

  return `fbq('track', 'ViewContent', ${JSON.stringify(eventData)});`;
};

/**
 * Execute client-side ViewContent tracking
 * This function can be called directly in the browser
 */
export const trackViewContentClient = (contentData: {
  content_ids: string[];
  content_type?: string;
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    const eventData: Record<string, any> = {
      content_ids: contentData.content_ids,
      content_type: contentData.content_type || "product",
    };

    // Add optional parameters if provided
    if (contentData.content_name)
      eventData.content_name = contentData.content_name;
    if (contentData.content_category)
      eventData.content_category = contentData.content_category;
    if (contentData.value) eventData.value = contentData.value;
    if (contentData.currency) eventData.currency = contentData.currency;

    (window as any).fbq("track", "ViewContent", eventData);
  }
};
