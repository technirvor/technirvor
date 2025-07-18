import type React from "react"
import HeroSection from "@/components/home/hero-section"
import FeaturedProducts from "@/components/home/featured-products"
import CategoryScroll from "@/components/home/category-scroll"
import BannerSection from "@/components/home/banner-section"
import AllProducts from "@/components/home/all-products"
import { Suspense } from "react"

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
  )
}
