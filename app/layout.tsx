import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
import {
  googleAnalyticsScriptTags,
  metaPixelScriptTags,
} from "@/lib/analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Tech Nirvor - Best Online Shopping in Bangladesh",
    template: "%s | Tech Nirvor",
  },
  description:
    "Shop the best products online in Bangladesh. Fast delivery, cash on delivery, authentic products. Electronics, Fashion, Home & Garden, Sports, Books, Beauty products at best prices.",
  keywords: [
    "online shopping bangladesh",
    "ecommerce bd",
    "cash on delivery",
    "electronics bangladesh",
    "fashion bangladesh",
    "home garden bangladesh",
    "sports equipment bangladesh",
    "books bangladesh",
    "beauty products bangladesh",
    "fast delivery dhaka",
    "authentic products",
    "best prices bangladesh",
  ],
  authors: [{ name: "Tech Nirvor" }],
  creator: "Tech Nirvor",
  publisher: "Tech Nirvor",
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
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "/",
    title: "Tech Nirvor - Best Online Shopping in Bangladesh",
    description:
      "Shop the best products online in Bangladesh. Fast delivery, cash on delivery, authentic products at best prices.",
    siteName: "Tech Nirvor",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tech Nirvor - Online Shopping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Nirvor - Best Online Shopping in Bangladesh",
    description:
      "Shop the best products online in Bangladesh. Fast delivery, cash on delivery, authentic products at best prices.",
    images: ["/og-image.jpg"],
    creator: "@technirvor",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  generator: "v0.dev",
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo/favicon-White.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tech Nirvor" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Tech Nirvor",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com",
              description:
                "Best online shopping in Bangladesh with cash on delivery",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://technirvor.com"}/products?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
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
        {metaPixelScriptTags().map((tag, i) => {
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
        <Navbar />
        {children}
        <Toaster position="top-right" />
        <Analytics mode="production" />;
        <SpeedInsights />
      </body>
    </html>
  );
}
