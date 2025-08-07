import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ClientTracker from "./client-tracker";

interface PageProps {
  params: {
    code: string;
  };
}

export default async function ShortLinkRedirect({ params }: PageProps) {
  const { code } = await params;

  let shortLink;

  try {
    const supabase = createServerClient();

    // Fetch the short link from the database
    const { data, error } = await supabase
      .from("short_links")
      .select("original_url, expires_at")
      .eq("short_code", code)
      .single();

    if (error || !data) {
      notFound();
    }

    shortLink = data;

    // Check if the link has expired
    if (shortLink.expires_at && new Date(shortLink.expires_at) < new Date()) {
      notFound();
    }

    // Note: Click tracking is now handled client-side to ensure unique user tracking
  } catch (error) {
    console.error("Error processing short link:", error);
    notFound();
  }

  // Return the client tracker component which will handle both tracking and redirect
  return (
    <ClientTracker shortCode={code} originalUrl={shortLink.original_url} />
  );
}
