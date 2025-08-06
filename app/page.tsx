import { Suspense } from "react";
import HomePageClient from "@/components/home-page-client";
import HomeSkeleton from "@/components/home-skeleton";
import ChatAgent from "@/components/chat-agent";

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
