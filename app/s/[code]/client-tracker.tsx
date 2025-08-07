"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ClientTrackerProps {
  shortCode: string;
  originalUrl: string;
}

export default function ClientTracker({
  shortCode,
  originalUrl,
}: ClientTrackerProps) {
  useEffect(() => {
    const trackAndRedirect = async () => {
      // Check if this user has already clicked this link
      const storageKey = `clicked_${shortCode}`;
      const hasClicked = localStorage.getItem(storageKey);

      if (!hasClicked) {
        // Mark this link as clicked for this user
        localStorage.setItem(storageKey, "true");

        // Increment the click count
        try {
          await supabase.rpc("increment_clicks", { short_code: shortCode });
        } catch (error) {
          console.error("Error tracking click:", error);
          // If there's an error, remove the localStorage entry so it can be retried
          localStorage.removeItem(storageKey);
        }
      }

      // Redirect to the original URL
      window.location.href = originalUrl;
    };

    trackAndRedirect();
  }, [shortCode, originalUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
