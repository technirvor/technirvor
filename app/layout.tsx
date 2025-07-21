import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import Navbar from "@/components/layout/navbar"
import MobileBottomNav from "@/components/layout/mobile-bottom-nav"
import Footer from "@/components/layout/footer"
import Providers from "@/components/providers"
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"
import Script from "next/script"

export const metadata: Metadata = {
  metadataBase: new URL("https://technirvor.com"),
  title: "Tech Nirvor | Best Online Shopping in Bangladesh 2024 – Electronics, Fashion, Deals",
  description: "Fuelling Your Digital Life, Without Breaking the Bank. Discover the latest electronics, gadgets, and accessories at unbeatable prices.",
  manifest: "/manifest.json",
  generator: "v0.dev",
  keywords: [
    "Tech Nirvor",
    "Bangladesh e-commerce",
    "online shopping Bangladesh",
    "buy online Bangladesh",
    "best deals Bangladesh",
    "electronics Bangladesh",
    "fashion Bangladesh",
    "home appliances Bangladesh",
    "top brands Bangladesh",
    "discounts Bangladesh",
    "secure payment Bangladesh",
    "Tech Nirvor deals",
    "Tech Nirvor Bangladesh",
    "authentic products Bangladesh",
    "fast delivery Bangladesh"
  ],
  authors: [{ name: "Tech Nirvor Team", url: "https://technirvor.com" }],
  openGraph: {
    title: "Tech Nirvor | Best Online Shopping in Bangladesh 2024 – Electronics, Fashion, Deals",
    description: "Fuelling Your Digital Life, Without Breaking the Bank. Discover the latest electronics, gadgets, and accessories at unbeatable prices.",
    url: "https://technirvor.com",
    siteName: "Tech Nirvor",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tech Nirvor - Online Shopping Bangladesh"
      }
    ],
    locale: "en_BD",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Nirvor | Best Online Shopping in Bangladesh 2024 – Electronics, Fashion, Deals",
    description: "Fuelling Your Digital Life, Without Breaking the Bank. Discover the latest electronics, gadgets, and accessories at unbeatable prices.",
    images: ["/og-image.jpg"]

  }
}

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo/fav-white.png" type="image/png" />
      </head>
      <body className="antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Meta Pixel Code using next/script */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1296029782048566');
            fbq('track', 'PageView');
          `}
        </Script>
        {/* End Meta Pixel Code */}
        {/* Meta Pixel NoScript */}
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1296029782048566&ev=PageView&noscript=1" />
        </noscript>
        {/* End Meta Pixel NoScript */}
        <Providers>
          <ServiceWorkerRegister />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
          </div>
        </Providers>
      </body>
    </html>
  )
}
