"use client";
import { useEffect, useState, useCallback } from "react";
import HeroSection from "@/components/hero-section";
import CategoryScroll from "@/components/category-scroll";
import FeaturedProducts from "@/components/featured-products";
import BannerSection from "@/components/banner-section";
import InfiniteProducts from "@/components/infinite-products";
import { supabase } from "@/lib/supabase";
import type { Product, Category, HeroSlide } from "@/lib/types";

export default function HomePageClient() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [heroSlidesRes, categoriesRes, featuredProductsRes, productsRes] =
          await Promise.all([
            supabase
              .from("hero_slides")
              .select("*")
              .eq("is_active", true)
              .order("order_index"),
            supabase.from("categories").select("*").order("name"),
            supabase
              .from("products")
              .select(`*, category:categories(*)`)
              .eq("is_featured", true)
              .gt("stock", 0)
              .order("created_at", { ascending: false })
              .limit(10),
            supabase
              .from("products")
              .select(`*, category:categories(*)`, { count: "exact" })
              .gt("stock", 0)
              .order("created_at", { ascending: false })
              .range(0, 19),
          ]);
        setHeroSlides(heroSlidesRes.data || []);
        setCategories(categoriesRes.data || []);
        setFeaturedProducts(featuredProductsRes.data || []);
        setProducts(productsRes.data || []);
        setHasMore(productsRes.count ? 20 < productsRes.count : false);
      } catch (error) {
        setHeroSlides([]);
        setCategories([]);
        setFeaturedProducts([]);
        setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const loadMoreProducts = useCallback(async (offset: number) => {
    try {
      const { data, count, error } = await supabase
        .from("products")
        .select(`*, category:categories(*)`, { count: "exact" })
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .range(offset, offset + 19);
      if (error) throw error;
      setProducts((prev) => [...prev, ...(data || [])]);
      setHasMore(count ? offset + 20 < count : false);
      return {
        products: data || [],
        hasMore: count ? offset + 20 < count : false,
      };
    } catch (error) {
      return { products: [], hasMore: false };
    }
  }, []);

  return (
    <main className="min-h-screen">
      {loading ? (
        <div className="h-64 md:h-96 bg-gray-200 animate-pulse" />
      ) : (
        <HeroSection slides={heroSlides} />
      )}
      {loading ? (
        <div className="h-32 bg-gray-50 animate-pulse" />
      ) : (
        <CategoryScroll categories={categories} />
      )}
      {loading ? (
        <div className="h-64 bg-white animate-pulse" />
      ) : (
        <FeaturedProducts products={featuredProducts} />
      )}
      <BannerSection />
      {loading ? (
        <div className="h-96 bg-white animate-pulse" />
      ) : (
        <InfiniteProducts
          initialProducts={products}
          hasMore={hasMore}
          onLoadMore={loadMoreProducts}
        />
      )}
    </main>
  );
}
