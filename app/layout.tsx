import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

import { Toaster } from "sonner";
import {
  googleAnalyticsScriptTags,
  metaPixelScriptTags,
} from "@/lib/analytics";
import { isMetaConfigured, getMetaConfig } from "@/lib/meta";
import ConditionalLayout from "@/components/conditional-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default:
      "Tech Nirvor - Best Online Shopping in Bangladesh | Electronics, Fashion & More",
    template: "%s | Tech Nirvor - Best Online Shopping Bangladesh",
  },
  description:
    "🛒 Shop the best products online in Bangladesh with Tech Nirvor! ✅ Fast delivery nationwide ✅ Cash on delivery ✅ Authentic products ✅ Best prices. Electronics, Fashion, Home & Garden, Sports, Books, Beauty products. Order now!",
  keywords: [
    "online shopping bangladesh",
    "tech nirvor",
    "ecommerce bangladesh",
    "cash on delivery bangladesh",
    "electronics bangladesh",
    "fashion bangladesh",
    "home garden bangladesh",
    "sports equipment bangladesh",
    "books bangladesh",
    "beauty products bangladesh",
    "fast delivery dhaka",
    "authentic products bangladesh",
    "best prices bangladesh",
    "online store bd",
    "shopping bd",
    "buy online bangladesh",
    "technirvor",
    "tech nirvor bd",
    "bangladesh online shopping",
    "dhaka online shopping",
    "chittagong online shopping",
    "sylhet online shopping",
  ],
  authors: [{ name: "Tech Nirvor", url: "https://technirvor.com" }],
  creator: "Tech Nirvor",
  publisher: "Tech Nirvor",
  category: "E-commerce",
  classification: "Online Shopping Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com",
  ),
  alternates: {
    canonical: "/",
    languages: {
      "en-BD": "/",
      "bn-BD": "/bn",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "/",
    title:
      "Tech Nirvor - Best Online Shopping in Bangladesh | Electronics, Fashion & More",
    description:
      "🛒 Shop the best products online in Bangladesh with Tech Nirvor! ✅ Fast delivery nationwide ✅ Cash on delivery ✅ Authentic products ✅ Best prices. Electronics, Fashion, Home & Garden, Sports, Books, Beauty products. Order now!",
    siteName: "Tech Nirvor",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tech Nirvor - Best Online Shopping in Bangladesh",
      },
      {
        url: "/logo/logo-black.png",
        width: 800,
        height: 600,
        alt: "Tech Nirvor Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@technirvor",
    title:
      "Tech Nirvor - Best Online Shopping in Bangladesh | Electronics, Fashion & More",
    description:
      "🛒 Shop the best products online in Bangladesh with Tech Nirvor! ✅ Fast delivery nationwide ✅ Cash on delivery ✅ Authentic products ✅ Best prices.",
    images: ["/og-image.jpg"],
    creator: "@technirvor",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tech Nirvor",
    startupImage: [
      {
        url: "/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Tech Nirvor",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport = {
  themeColor: "#000000",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-BD">
      <head>
        {/* Favicon with cache busting */}
        <link
          rel="icon"
          type="image/x-icon"
          href={`/favicon.ico?v=${Date.now()}`}
        />
        <link
          rel="shortcut icon"
          type="image/x-icon"
          href={`/favicon.ico?v=${Date.now()}`}
        />

        {/* Apple Touch Icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`/logo/favicon-White.png?v=${Date.now()}`}
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href={`/logo/favicon-White.png?v=${Date.now()}`}
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href={`/logo/favicon-White.png?v=${Date.now()}`}
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href={`/logo/favicon-White.png?v=${Date.now()}`}
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href={`/logo/favicon-White.png?v=${Date.now()}`}
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href={`/logo/favicon-White.png?v=${Date.now()}`}
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href={`/logo/favicon-White.png?v=${Date.now()}`}
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href={`/logo/favicon-White.png?v=${Date.now()}`}
        />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href={`/logo/favicon-White.png?v=${Date.now()}`}
        />

        {/* Android Chrome Icons */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href={`/icon-192x192.png?v=${Date.now()}`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href={`/icon-512x512.png?v=${Date.now()}`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="384x384"
          href={`/icon-384x384.png?v=${Date.now()}`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="256x256"
          href={`/icon-256x256.png?v=${Date.now()}`}
        />

        {/* Microsoft Tiles */}
        <meta
          name="msapplication-TileImage"
          content={`/icon-512x512.png?v=${Date.now()}`}
        />
        <meta name="msapplication-TileColor" content="#000000" />

        {/* SEO and Social Media */}
        <link
          rel="canonical"
          href={process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com"}
        />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-navbutton-color" content="#000000" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Sitemap */}
        <link
          rel="sitemap"
          type="application/xml"
          title="Sitemap"
          href="/sitemap-0.xml"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tech Nirvor" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Enhanced Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Tech Nirvor",
              alternateName: "TechNirvor",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com",
              description:
                "Best online shopping platform in Bangladesh offering electronics, fashion, home & garden, sports, books, and beauty products with fast delivery and cash on delivery options.",
              inLanguage: "en-BD",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com"}/products?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
              publisher: {
                "@type": "Organization",
                name: "Tech Nirvor",
                url:
                  process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com",
                logo: {
                  "@type": "ImageObject",
                  url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com"}/logo/logo-black.png`,
                  width: 800,
                  height: 600,
                },
                sameAs: [
                  "https://facebook.com/technirvor",
                  "https://twitter.com/technirvor",
                  "https://instagram.com/technirvor",
                ],
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Tech Nirvor",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com",
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com"}/logo/logo-black.png`,
              description:
                "Leading e-commerce platform in Bangladesh offering authentic products with fast delivery and cash on delivery options.",
              address: {
                "@type": "PostalAddress",
                addressCountry: "BD",
                addressRegion: "Dhaka",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                areaServed: "BD",
                availableLanguage: ["English", "Bengali"],
              },
              sameAs: [
                "https://facebook.com/technirvor",
                "https://twitter.com/technirvor",
                "https://instagram.com/technirvor",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Tech Nirvor",
              image: `${process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com"}/logo/logo-black.png`,
              description:
                "Best online shopping store in Bangladesh with authentic products, fast delivery, and cash on delivery options.",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com",
              telephone: "+880-XXX-XXXXXX",
              address: {
                "@type": "PostalAddress",
                addressCountry: "BD",
                addressRegion: "Dhaka",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "23.8103",
                longitude: "90.4125",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "00:00",
                closes: "23:59",
              },
              paymentAccepted: [
                "Cash",
                "Credit Card",
                "Debit Card",
                "Mobile Banking",
              ],
              currenciesAccepted: "BDT",
            }),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Tech Nirvor",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com",
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com"}/logo.png`,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+880-1410077761",
                contactType: "customer service",
                availableLanguage: ["English", "Bengali"],
              },
              sameAs: [
                "https://facebook.com/technirvor",
                "https://twitter.com/technirvor",
                "https://instagram.com/technirvor",
              ],
            }),
          }}
        />
        {/* Google Analytics & Meta Pixel */}
        {googleAnalyticsScriptTags().map((tag, i) => {
          if (tag.startsWith("<script")) {
            return (
              <script
                key={`ga-${i}`}
                dangerouslySetInnerHTML={{
                  __html: tag.replace(/<script.*?>|<\/script>/g, ""),
                }}
                async={tag.includes("async")}
                src={tag.match(/src=\\?"([^"]+)\\?"/)?.[1]}
              />
            );
          } else {
            return (
              <script
                key={`ga-${i}`}
                dangerouslySetInnerHTML={{
                  __html: tag.replace(/<script.*?>|<\/script>/g, ""),
                }}
              />
            );
          }
        })}
        {/* Enhanced Meta Pixel with CAPI Integration */}
        {isMetaConfigured() &&
          metaPixelScriptTags().map((tag, i) => {
            if (tag.startsWith("<script")) {
              return (
                <script
                  key={`mp-${i}`}
                  dangerouslySetInnerHTML={{
                    __html: tag.replace(/<script.*?>|<\/script>/g, ""),
                  }}
                />
              );
            } else if (tag.startsWith("<noscript")) {
              return (
                <noscript
                  key={`mp-noscript-${i}`}
                  dangerouslySetInnerHTML={{
                    __html: tag.replace(/<noscript.*?>|<\/noscript>/g, ""),
                  }}
                />
              );
            }
            return null;
          })}

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KL7F95T4');`,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Meta CAPI Configuration Debug Info (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log('Meta CAPI Configuration:', ${JSON.stringify(getMetaConfig())});
                // Enhanced Meta Pixel tracking with CAPI integration
                window.metaTrackingEnabled = ${isMetaConfigured()};
                
                // Enhanced ViewContent tracking function
                window.trackViewContent = function(contentData) {
                  if (window.metaTrackingEnabled && window.fbq) {
                    try {
                      // Client-side pixel tracking
                      window.fbq('track', 'ViewContent', {
                        content_ids: contentData.content_ids || [],
                        content_type: contentData.content_type || 'product',
                        content_name: contentData.content_name,
                        content_category: contentData.content_category,
                        value: contentData.value,
                        currency: contentData.currency || 'BDT'
                      });
                      
                      // Send to server for CAPI tracking
                      fetch('/api/meta-capi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          eventName: 'ViewContent',
                          eventData: contentData,
                          userInfo: {
                            fbp: window.fbq && window.fbq.getState ? window.fbq.getState().pixels[Object.keys(window.fbq.getState().pixels)[0]]?.userData?.fbp : undefined,
                            fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1]
                          }
                        })
                      }).catch(err => console.warn('Meta CAPI error:', err));
                    } catch (error) {
                      console.warn('Meta tracking error:', error);
                    }
                  }
                };
                
                // Enhanced AddToCart tracking function
                window.trackAddToCart = function(productData) {
                  if (window.metaTrackingEnabled && window.fbq) {
                    try {
                      // Client-side pixel tracking
                      window.fbq('track', 'AddToCart', {
                        content_ids: productData.content_ids || [],
                        content_type: productData.content_type || 'product',
                        content_name: productData.content_name,
                        value: productData.value,
                        currency: productData.currency || 'BDT'
                      });
                      
                      // Send to server for CAPI tracking
                      fetch('/api/meta-capi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          eventName: 'AddToCart',
                          eventData: productData,
                          userInfo: {
                            fbp: window.fbq && window.fbq.getState ? window.fbq.getState().pixels[Object.keys(window.fbq.getState().pixels)[0]]?.userData?.fbp : undefined,
                            fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1]
                          }
                        })
                      }).catch(err => console.warn('Meta CAPI error:', err));
                    } catch (error) {
                      console.warn('Meta tracking error:', error);
                    }
                  }
                };
                
                // Enhanced Purchase tracking function
                window.trackPurchase = function(orderData) {
                  if (window.metaTrackingEnabled && window.fbq) {
                    try {
                      // Client-side pixel tracking
                      window.fbq('track', 'Purchase', {
                        value: orderData.value,
                        currency: orderData.currency || 'BDT',
                        content_ids: orderData.content_ids || [],
                        content_type: 'product',
                        num_items: orderData.num_items
                      });
                      
                      // Send to server for CAPI tracking
                      fetch('/api/meta-capi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          eventName: 'Purchase',
                          eventData: orderData,
                          userInfo: {
                            fbp: window.fbq && window.fbq.getState ? window.fbq.getState().pixels[Object.keys(window.fbq.getState().pixels)[0]]?.userData?.fbp : undefined,
                            fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1]
                          }
                        })
                      }).catch(err => console.warn('Meta CAPI error:', err));
                    } catch (error) {
                      console.warn('Meta tracking error:', error);
                    }
                  }
                };
              `,
            }}
          />
        )}
        {/* Disable right-click and console in production */}
        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Show warning in console before disabling
                try {
                  var style1 = 'color: red; font-size: 2em; font-weight: bold;';
                  var style2 = 'color: orange; font-size: 1.2em;';
                  console.log('%cWarning!', style1);
                  console.log('%cThis browser feature is for developers. If someone told you to copy-paste something here, it is likely a scam and may compromise your account.', style2);
                } catch (e) {}

                // Ask for browser notification permission
                if ('Notification' in window && Notification.permission !== 'granted') {
                  window.addEventListener('load', function() {
                    setTimeout(function() {
                      Notification.requestPermission();
                    }, 2000);
                  });
                }

                // Disable right-click
                document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

                // Disable all console methods and prevent re-assignment
                (function() {
                  var handler = {
                    get: function() { return function(){}; },
                    set: function() { return true; }
                  };
                  var fakeConsole = new Proxy({}, handler);
                  var methods = ['log', 'warn', 'error', 'info', 'debug', 'trace', 'table', 'group', 'groupCollapsed', 'groupEnd', 'dir', 'dirxml', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeLog', 'timeStamp', 'clear', 'count', 'countReset', 'assert'];
                  methods.forEach(function(method) {
                    fakeConsole[method] = function(){};
                  });
                  window.console = fakeConsole;
                  Object.freeze(window.console);
                })();

                // Block F12, Ctrl+Shift+I/J/C/U, Cmd+Opt+I/J/C/U, and right-click Inspect
                document.addEventListener('keydown', function(e) {
                  if (
                    e.key === 'F12' ||
                    (e.ctrlKey && e.shiftKey && ['I','J','C','U'].includes(e.key.toUpperCase())) ||
                    (e.metaKey && e.altKey && ['I','J','C','U'].includes(e.key.toUpperCase()))
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KL7F95T4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster position="top-right" />
        <Analytics mode="production" />
        <SpeedInsights />
      </body>
    </html>
  );
}
