// Analytics and tracking integration for Meta Pixel, Meta CAPI, and Google Analytics

// Google Analytics (gtag.js)
export const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

export function googleAnalyticsScriptTags() {
  if (!googleAnalyticsId) return [];
  return [
    `<script async src=\"https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}\"></script>`,
    `<script>\nwindow.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${googleAnalyticsId}');\n</script>`,
  ];
}

// Meta Pixel
export const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export function metaPixelScriptTags() {
  if (!metaPixelId) return [];
  return [
    `<script>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,'script',\n'https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', '${metaPixelId}');\nfbq('track', 'PageView');\n</script>`,
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
    await fetch("/api/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, eventData }),
    });
  } catch (e) {
    // Handle error
  }
}
