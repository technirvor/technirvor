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
    <div className="w-full py-8 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-6">
        <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span className="text-lg font-medium text-muted-foreground">{children}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col animate-pulse shadow-sm">
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      {/* Meta Pixel Code */}
      <Script
        id="facebook-pixel-home"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '772937612559753');
            fbq('track', 'PageView');
          `
        }}
      />
      {/* End Meta Pixel Code */}
      
      {/* Meta Pixel NoScript */}
      <noscript>
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }} 
          src="https://www.facebook.com/tr?id=772937612559753&ev=PageView&noscript=1" 
        />
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