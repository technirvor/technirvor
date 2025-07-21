import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import Navbar from "@/components/layout/navbar"
import MobileBottomNav from "@/components/layout/mobile-bottom-nav"
import Footer from "@/components/layout/footer"
import Providers from "@/components/providers"
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"

export const metadata: Metadata = {
  metadataBase: new URL("https://technirvor.com"),
  title: "Tech Nirvor | Best Online Shopping in Bangladesh – Electronics, Fashion, Deals",
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
    title: "Tech Nirvor | Best Online Shopping in Bangladesh – Electronics, Fashion, Deals",
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
    title: "Tech Nirvor | Best Online Shopping in Bangladesh – Electronics, Fashion, Deals",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Tech Nirvor",
              "url": "https://technirvor.com",
              "description": "Fuelling Your Digital Life, Without Breaking the Bank. Discover the latest electronics, gadgets, and accessories at unbeatable prices.",
              "publisher": {
                "@type": "Organization",
                "name": "Tech Nirvor Team",
                "url": "https://technirvor.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "/logo/logo-white.png"
                }
              }
            })
          }}
        />
      </head>
      <body className="antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
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