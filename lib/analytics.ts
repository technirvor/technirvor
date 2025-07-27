// Analytics and tracking integration for Meta Pixel, Meta CAPI, and Google Analytics

// Google Analytics (gtag.js)
export const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

export function googleAnalyticsScriptTags() {
  if (!googleAnalyticsId || googleAnalyticsId === "G-XXXXXXXXXX") return [];
  return [
    `<script async src=\"https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}\" onerror=\"console.warn('Failed to load Google Analytics')\"></script>`,
    `<script>
      try {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleAnalyticsId}', {
          send_page_view: false // Prevent automatic page view tracking
        });
      } catch (error) {
        console.warn('Google Analytics initialization failed:', error);
      }
    </script>`,
  ];
}

// Meta Pixel
export const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export function metaPixelScriptTags() {
  if (!metaPixelId) return [];
  return [
    `<script>
      try {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        // Add error handling for Facebook Pixel
        window.fbq = window.fbq || function() {
          try {
            (window.fbq.q = window.fbq.q || []).push(arguments);
          } catch (error) {
            console.warn('Facebook Pixel error:', error);
          }
        };
        window.fbq.q = window.fbq.q || [];
        
        fbq('init', '${metaPixelId}');
        fbq('track', 'PageView');
      } catch (error) {
        console.warn('Facebook Pixel initialization failed:', error);
      }
    </script>`,
    `<noscript><img height=\"1\" width=\"1\" style=\"display:none\" src=\"https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1\" /></noscript>`,
  ];
}

// Meta Conversion API (server-side, not client-side)
// You should implement CAPI on your backend and trigger it on conversion events.
// For client-side, you can send events to your backend endpoint here if needed.

// Example: send conversion event to backend
export async function sendMetaConversionEvent(
  eventName: string,
  eventData: any,
) {
  try {
    const response = await fetch("/api/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, eventData }),
    });
    
    if (!response.ok) {
      throw new Error(`Meta CAPI request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn("Meta Conversion API error:", error);
    // Don't throw the error to prevent breaking the user experience
    return null;
  }
}

// Safe tracking functions that won't break the app
export function trackGoogleAnalyticsEvent(eventName: string, parameters: any = {}) {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  } catch (error) {
    console.warn('Google Analytics tracking error:', error);
  }
}

export function trackFacebookPixelEvent(eventName: string, parameters: any = {}) {
  try {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', eventName, parameters);
    }
  } catch (error) {
    console.warn('Facebook Pixel tracking error:', error);
  }
}
