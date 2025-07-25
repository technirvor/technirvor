import { Suspense } from "react";
import HomePageClient from "@/components/home-page-client";
import HeroSection from "@/components/hero-section";
import CategoryScroll from "@/components/category-scroll";
import FeaturedProducts from "@/components/featured-products";
import BannerSection from "@/components/banner-section";
import InfiniteProducts from "@/components/infinite-products";
import { supabase } from "@/lib/supabase";
import type { Product, Category, HeroSlide } from "@/lib/types";

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("order_index");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("is_featured", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function getProducts(
  offset = 0,
  limit = 20,
): Promise<{ products: Product[]; hasMore: boolean }> {
  try {
    const { data, error, count } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*)
      `,
        { count: "exact" },
      )
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const products = data || [];
    const hasMore = count ? offset + limit < count : false;

    return { products, hasMore };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], hasMore: false };
  }
}

export default async function HomePage() {
  return (
    <>
      {/* Client-side HomePage with useEffect for data fetching */}
      <Suspense fallback={<div className="min-h-screen" />}>
        <div suppressHydrationWarning>
          <main className="min-h-screen">
            {/* HomePageClient handles all data fetching and rendering */}
            <HomePageClient />
          </main>
        </div>
      </Suspense>
    </>
  );
}
