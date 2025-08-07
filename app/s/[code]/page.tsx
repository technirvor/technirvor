import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

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

    // Increment click count asynchronously (fire and forget)
    supabase.rpc("increment_clicks", { short_code: code }).then(() => {});
  } catch (error) {
    console.error("Error processing short link:", error);
    notFound();
  }

  // Redirect to the original URL (outside try-catch to avoid catching NEXT_REDIRECT)
  redirect(shortLink.original_url);
}
