# Enhanced Facebook Conversions API Implementation

This document describes the enhanced Facebook Conversions API implementation that includes additional parameters as specified in the [Facebook Conversions API documentation](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters).

## Overview

The enhanced implementation provides:

1. **Extended User Data Parameters** - Additional user matching parameters for better attribution
2. **Enhanced Custom Data Parameters** - More detailed event data for improved optimization
3. **Server Event Configuration** - Advanced configuration options for privacy and testing
4. **Privacy-Compliant Data Collection** - Built-in privacy controls and data minimization

## Key Enhancements

### Enhanced User Data Parameters

```typescript
interface MetaUserInfo {
  // Basic user information (existing)
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
  
  // Enhanced user data parameters (NEW)
  dateOfBirth?: string; // YYYYMMDD format
  gender?: 'm' | 'f';
  externalId?: string;
  subscriptionId?: string;
  leadId?: string;
  
  // Advanced matching parameters (NEW)
  madid?: string; // Mobile Advertiser ID
  anon_id?: string; // Anonymous ID
  click_id?: string; // Click ID from ad
  browser_id?: string; // Browser ID
}
```

### Enhanced Custom Data Parameters

```typescript
interface MetaEventData {
  // Basic event data (existing)
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  num_items?: number;
  order_id?: string;
  search_string?: string;
  
  // Enhanced custom data parameters (NEW)
  contents?: Array<{
    id: string;
    quantity?: number;
    item_price?: number;
    delivery_category?: 'home_delivery' | 'in_store' | 'curbside';
  }>;
  content_brand?: string;
  predicted_ltv?: number;
  status?: string;
  delivery_category?: 'home_delivery' | 'in_store' | 'curbside';
  custom_data?: Record<string, any>;
}
```

### Server Event Configuration

```typescript
interface MetaServerEventConfig {
  event_id?: string; // Custom event ID for deduplication
  opt_out?: boolean; // User opt-out status
  data_processing_options?: string[]; // Privacy controls
  data_processing_options_country?: number; // Country code
  data_processing_options_state?: number; // State code
  partner_agent?: string; // Partner identification
  test_event_code?: string; // Test event code
}
```

## Usage Examples

### Enhanced Purchase Tracking

```typescript
import { trackEnhancedPurchase } from '@/lib/meta-enhanced-examples';

// Track a purchase with enhanced parameters
const result = await trackEnhancedPurchase(
  {
    value: 99.99,
    currency: 'USD',
    order_id: 'ORDER_123',
    content_ids: ['PROD_001', 'PROD_002'],
    num_items: 2
  },
  {
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    city: 'New York',
    state: 'NY',
    country: 'US',
    zipCode: '10001',
    dateOfBirth: '19900115', // YYYYMMDD format
    gender: 'm',
    externalId: 'user_12345'
  },
  request
);
```

### Enhanced Add to Cart Tracking

```typescript
import { trackEnhancedAddToCart } from '@/lib/meta-enhanced-examples';

const result = await trackEnhancedAddToCart(
  {
    content_ids: ['PROD_001'],
    content_name: 'Premium Widget',
    content_brand: 'TechniRvor',
    content_category: 'Electronics',
    value: 49.99,
    currency: 'USD'
  },
  userInfo,
  request
);
```

### Direct API Usage with Enhanced Parameters

```typescript
import { sendServerEvent } from '@/lib/meta';

const result = await sendServerEvent(
  'Purchase',
  {
    value: 99.99,
    currency: 'USD',
    order_id: 'ORDER_123',
    content_ids: ['PROD_001'],
    contents: [{
      id: 'PROD_001',
      quantity: 1,
      item_price: 99.99,
      delivery_category: 'home_delivery'
    }],
    content_brand: 'TechniRvor',
    predicted_ltv: 299.97,
    status: 'completed',
    delivery_category: 'home_delivery'
  },
  {
    email: 'customer@example.com',
    dateOfBirth: '19900115',
    gender: 'm',
    externalId: 'user_12345'
  },
  request,
  {
    event_id: 'purchase_ORDER_123_1234567890',
    partner_agent: 'technirvor_ecommerce_v1.0'
  }
);
```

## API Endpoint Usage

The `/api/meta-capi` endpoint now supports the enhanced configuration:

```javascript
// Client-side usage
const response = await fetch('/api/meta-capi', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    eventName: 'Purchase',
    eventData: {
      value: 99.99,
      currency: 'USD',
      order_id: 'ORDER_123',
      content_ids: ['PROD_001'],
      contents: [{
        id: 'PROD_001',
        quantity: 1,
        item_price: 99.99,
        delivery_category: 'home_delivery'
      }],
      content_brand: 'TechniRvor',
      predicted_ltv: 299.97
    },
    userInfo: {
      email: 'customer@example.com',
      dateOfBirth: '19900115',
      gender: 'm'
    },
    config: {
      event_id: 'purchase_ORDER_123_1234567890',
      partner_agent: 'technirvor_ecommerce_v1.0'
    }
  })
});
```

## Privacy and Compliance

### Data Processing Options

The implementation supports Facebook's data processing options for privacy compliance:

```typescript
const config: MetaServerEventConfig = {
  data_processing_options: ['LDU'], // Limited Data Use
  data_processing_options_country: 1, // USA
  data_processing_options_state: 1000 // California
};
```

### Privacy-Compliant Data Collection

```typescript
import { collectUserDataPrivacyCompliant } from '@/lib/meta-enhanced-examples';

const compliantUserData = collectUserDataPrivacyCompliant(
  rawUserData,
  {
    analytics: true,
    marketing: userConsent.marketing,
    personalization: userConsent.personalization
  }
);
```

## Best Practices

### 1. Event ID for Deduplication

Always provide a unique `event_id` to prevent duplicate events:

```typescript
const config = {
  event_id: `${eventName}_${orderId}_${timestamp}`
};
```

### 2. Partner Agent Identification

Use a consistent partner agent string:

```typescript
const config = {
  partner_agent: 'your_company_platform_version'
};
```

### 3. Enhanced User Matching

Provide as many user parameters as possible for better attribution:

```typescript
const userInfo = {
  email: 'user@example.com',
  phone: '+1234567890',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '19900115',
  gender: 'm',
  externalId: 'user_12345'
};
```

### 4. Detailed Product Information

Use the `contents` array for detailed product data:

```typescript
const eventData = {
  contents: products.map(product => ({
    id: product.id,
    quantity: product.quantity,
    item_price: product.price,
    delivery_category: 'home_delivery'
  })),
  content_brand: 'YourBrand',
  predicted_ltv: calculateLifetimeValue(user)
};
```

## Testing

### Test Event Code

Use test event codes for development and testing:

```typescript
const config = {
  test_event_code: 'TEST12345'
};
```

### Environment Variables

Set up the following environment variables:

```bash
# Required
META_CAPI_ACCESS_TOKEN=your_access_token
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id

# Optional (for testing)
META_CAPI_TEST_CODE=your_test_code
```

## Migration Guide

### From Basic to Enhanced Implementation

1. **Update function calls** to include the new `config` parameter:
   ```typescript
   // Before
   await sendServerEvent(eventName, eventData, userInfo, request);
   
   // After
   await sendServerEvent(eventName, eventData, userInfo, request, config);
   ```

2. **Add enhanced parameters** to your event data:
   ```typescript
   const eventData = {
     // ... existing parameters
     contents: [...],
     content_brand: 'YourBrand',
     predicted_ltv: 299.97
   };
   ```

3. **Include additional user data** for better matching:
   ```typescript
   const userInfo = {
     // ... existing parameters
     dateOfBirth: '19900115',
     gender: 'm',
     externalId: 'user_12345'
   };
   ```

## Troubleshooting

### Common Issues

1. **Missing Required Parameters**: Ensure all required parameters are provided for each event type.
2. **Invalid Date Format**: Use YYYYMMDD format for `dateOfBirth`.
3. **SDK Method Errors**: Some advanced parameters may need to be added to `custom_data` if direct SDK methods are not available.

### Debugging

Enable detailed logging in development:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Meta CAPI Event:', { eventName, eventData, userInfo, config });
}
```

## Performance Considerations

1. **Batch Events**: Consider batching multiple events when possible.
2. **Async Processing**: Use async/await for non-blocking event sending.
3. **Error Handling**: Implement proper error handling to prevent blocking user experience.
4. **Rate Limiting**: Be aware of Facebook's rate limits for the Conversions API.

## Security

1. **Data Hashing**: All PII is automatically hashed before sending to Facebook.
2. **Environment Variables**: Store sensitive tokens in environment variables.
3. **HTTPS Only**: Ensure all API calls are made over HTTPS.
4. **Data Minimization**: Only collect and send necessary user data.

For more information, refer to the [Facebook Conversions API documentation](https://developers.facebook.com/docs/marketing-api/conversions-api/).