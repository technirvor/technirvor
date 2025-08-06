import { Suspense } from "react";
import HomePageClient from "@/components/home-page-client";
import HomeSkeleton from "@/components/home-skeleton";
import { supabase } from "@/lib/supabase";
import type { Product, Category, HeroSlide } from "@/lib/types";
import ChatAgent from "@/components/chat-agent";

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

export default async function HomePage() {
  return (
    <>
      {/* Client-side HomePage with useEffect for data fetching */}
      <Suspense fallback={<HomeSkeleton />}>
        <div suppressHydrationWarning>
          <main className="min-h-screen">
            {/* HomePageClient handles all data fetching and rendering */}
            <HomePageClient />
          </main>
        </div>
      </Suspense>
      <ChatAgent />
    </>
  );
}
