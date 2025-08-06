/**
 * Enhanced Facebook Conversions API Examples
 * 
 * This file demonstrates how to use the enhanced Meta Conversions API
 * with additional parameters as specified in the Facebook documentation:
 * https://developers.facebook.com/docs/marketing-api/conversions-api/parameters
 */

import { 
  sendServerEvent, 
  MetaEventData, 
  MetaUserInfo, 
  MetaServerEventConfig 
} from './meta';
import { NextRequest } from 'next/server';

/**
 * Enhanced Purchase Event Example
 * Includes additional parameters for better tracking and attribution
 */
export const trackEnhancedPurchase = async (
  orderData: {
    value: number;
    currency: string;
    order_id: string;
    content_ids: string[];
    num_items: number;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  const enhancedEventData: MetaEventData = {
    ...orderData,
    // Enhanced purchase parameters
    contents: orderData.content_ids.map((id, index) => ({
      id,
      quantity: 1,
      item_price: orderData.value / orderData.num_items,
      delivery_category: 'home_delivery' as const
    })),
    content_type: 'product',
    delivery_category: 'home_delivery',
    predicted_ltv: orderData.value * 3, // Estimated customer lifetime value
    status: 'completed'
  };

  const enhancedUserInfo: MetaUserInfo = {
    ...userInfo,
    // Add enhanced user matching parameters if available
    externalId: userInfo.email ? `user_${userInfo.email.split('@')[0]}` : undefined,
  };

  const config: MetaServerEventConfig = {
    event_id: `purchase_${orderData.order_id}_${Date.now()}`,
    partner_agent: 'technirvor_ecommerce_v1.0'
  };

  return sendServerEvent('Purchase', enhancedEventData, enhancedUserInfo, request, config);
};

/**
 * Enhanced Add to Cart Event Example
 * Includes product details and user behavior data
 */
export const trackEnhancedAddToCart = async (
  productData: {
    content_ids: string[];
    content_name: string;
    content_brand?: string;
    content_category?: string;
    value: number;
    currency: string;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  const enhancedEventData: MetaEventData = {
    ...productData,
    content_type: 'product',
    num_items: productData.content_ids.length,
    // Enhanced product data
    contents: productData.content_ids.map(id => ({
      id,
      quantity: 1,
      item_price: productData.value,
      delivery_category: 'home_delivery' as const
    })),
    content_brand: productData.content_brand,
    custom_data: {
      source_page: 'product_detail',
      user_journey_stage: 'consideration'
    }
  };

  const config: MetaServerEventConfig = {
    partner_agent: 'technirvor_ecommerce_v1.0'
  };

  return sendServerEvent('AddToCart', enhancedEventData, userInfo, request, config);
};

/**
 * Enhanced View Content Event Example
 * Includes detailed content information and user context
 */
export const trackEnhancedViewContent = async (
  contentData: {
    content_ids: string[];
    content_name: string;
    content_type: string;
    content_category?: string;
    content_brand?: string;
    value?: number;
    currency?: string;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  const enhancedEventData: MetaEventData = {
    ...contentData,
    // Enhanced content parameters
    contents: contentData.content_ids.map(id => ({
      id,
      quantity: 1,
      item_price: contentData.value || 0
    })),
    content_brand: contentData.content_brand,
    custom_data: {
      page_type: 'product_detail',
      referrer_source: request?.headers.get('referer') || 'direct',
      user_agent_family: getUserAgentFamily(request?.headers.get('user-agent')),
      session_duration: getSessionDuration(), // Custom function to track session
    }
  };

  const config: MetaServerEventConfig = {
    partner_agent: 'technirvor_ecommerce_v1.0'
  };

  return sendServerEvent('ViewContent', enhancedEventData, userInfo, request, config);
};

/**
 * Enhanced Lead Event Example
 * For lead generation with detailed qualification data
 */
export const trackEnhancedLead = async (
  leadData: {
    content_name: string;
    content_category?: string;
    value?: number;
    currency?: string;
    lead_type?: string;
    qualification_score?: number;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  const enhancedEventData: MetaEventData = {
    ...leadData,
    content_type: 'lead_form',
    predicted_ltv: leadData.qualification_score ? leadData.qualification_score * 100 : undefined,
    status: 'qualified',
    custom_data: {
      lead_type: leadData.lead_type || 'contact_form',
      qualification_score: leadData.qualification_score,
      form_completion_time: Date.now(),
      traffic_source: getTrafficSource(request)
    }
  };

  const enhancedUserInfo: MetaUserInfo = {
    ...userInfo,
    leadId: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  const config: MetaServerEventConfig = {
    partner_agent: 'technirvor_lead_gen_v1.0'
  };

  return sendServerEvent('Lead', enhancedEventData, enhancedUserInfo, request, config);
};

/**
 * Enhanced Search Event Example
 * Includes search context and user intent data
 */
export const trackEnhancedSearch = async (
  searchData: {
    search_string: string;
    content_category?: string;
    results_count?: number;
    search_type?: string;
  },
  userInfo: MetaUserInfo = {},
  request?: NextRequest
) => {
  const enhancedEventData: MetaEventData = {
    search_string: searchData.search_string,
    content_category: searchData.content_category,
    content_type: 'search_results',
    custom_data: {
      search_type: searchData.search_type || 'product_search',
      results_count: searchData.results_count || 0,
      search_filters_applied: getSearchFilters(request),
      search_session_id: getSearchSessionId(request)
    }
  };

  const config: MetaServerEventConfig = {
    partner_agent: 'technirvor_search_v1.0'
  };

  return sendServerEvent('Search', enhancedEventData, userInfo, request, config);
};

// Helper functions
function getUserAgentFamily(userAgent?: string | null): string {
  if (!userAgent) return 'unknown';
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari')) return 'safari';
  if (userAgent.includes('Edge')) return 'edge';
  return 'other';
}

function getSessionDuration(): number {
  // Implement session duration tracking logic
  return Math.floor(Math.random() * 300) + 60; // Mock: 1-5 minutes
}

function getTrafficSource(request?: NextRequest): string {
  const referer = request?.headers.get('referer');
  if (!referer) return 'direct';
  if (referer.includes('google')) return 'google';
  if (referer.includes('facebook')) return 'facebook';
  if (referer.includes('instagram')) return 'instagram';
  return 'referral';
}

function getSearchFilters(request?: NextRequest): string[] {
  // Extract search filters from URL parameters
  const url = new URL(request?.url || 'https://example.com');
  const filters: string[] = [];
  
  if (url.searchParams.get('category')) filters.push('category');
  if (url.searchParams.get('price_min')) filters.push('price_range');
  if (url.searchParams.get('brand')) filters.push('brand');
  if (url.searchParams.get('rating')) filters.push('rating');
  
  return filters;
}

function getSearchSessionId(request?: NextRequest): string {
  // Generate or retrieve search session ID
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Privacy-compliant user data collection
 * Ensures proper hashing and data minimization
 */
export const collectUserDataPrivacyCompliant = (
  userData: Partial<MetaUserInfo>,
  consent: {
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  }
): MetaUserInfo => {
  const compliantUserData: MetaUserInfo = {};

  // Only collect data if user has given appropriate consent
  if (consent.analytics) {
    compliantUserData.userAgent = userData.userAgent;
    compliantUserData.clientIpAddress = userData.clientIpAddress;
  }

  if (consent.marketing) {
    compliantUserData.email = userData.email;
    compliantUserData.phone = userData.phone;
    compliantUserData.fbc = userData.fbc;
    compliantUserData.fbp = userData.fbp;
  }

  if (consent.personalization) {
    compliantUserData.firstName = userData.firstName;
    compliantUserData.lastName = userData.lastName;
    compliantUserData.city = userData.city;
    compliantUserData.state = userData.state;
    compliantUserData.country = userData.country;
    compliantUserData.zipCode = userData.zipCode;
    compliantUserData.dateOfBirth = userData.dateOfBirth;
    compliantUserData.gender = userData.gender;
  }

  return compliantUserData;
};