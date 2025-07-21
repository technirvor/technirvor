import type React from "react"
import HeroSection from "@/components/home/hero-section"
import FeaturedProducts from "@/components/home/featured-products"
import CategoryScroll from "@/components/home/category-scroll"
import BannerSection from "@/components/home/banner-section"
import AllProducts from "@/components/home/all-products"
import { Suspense } from "react"
import Script from "next/script"

export const dynamic = "force-dynamic"

function LoadingSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      {/* Meta Pixel Code using next/script */}
      <Script id="facebook-pixel-home" strategy="afterInteractive" dangerouslySetInnerHTML={{
        __html: `!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1296029782048566');
        fbq('track', 'PageView');`
      }} />
      {/* End Meta Pixel Code */}
      {/* Meta Pixel NoScript */}
      <noscript>
        <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1296029782048566&ev=PageView&noscript=1" />
      </noscript>
      {/* End Meta Pixel NoScript */}
      <div className="flex flex-col min-h-screen">
        <HeroSection />
        <Suspense fallback={<LoadingSection>Loading categories...</LoadingSection>}>
          <CategoryScroll />
        </Suspense>
        <Suspense fallback={<LoadingSection>Loading featured products...</LoadingSection>}>
          <FeaturedProducts />
        </Suspense>
        <BannerSection />
        <Suspense fallback={<LoadingSection>Loading all products...</LoadingSection>}>
          <AllProducts />
        </Suspense>
      </div>
    </>
  )
}
