import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  return "unknown";
}

// Helper function to parse user agent for device type
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "mobile";
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  }
  return "desktop";
}

// GET - Handle short link redirect and track clicks
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } },
) {
  try {
    const { code } = params;

    if (!code) {
      return NextResponse.json(
        { error: "Short code is required" },
        { status: 400 },
      );
    }

    // Find the short link
    const { data: shortLink, error: fetchError } = await supabase
      .from("short_links")
      .select("*")
      .eq("short_code", code)
      .eq("is_active", true)
      .single();

    if (fetchError || !shortLink) {
      return NextResponse.json(
        { error: "Short link not found" },
        { status: 404 },
      );
    }

    // Check if link has expired
    if (shortLink.expires_at) {
      const expiryDate = new Date(shortLink.expires_at);
      const now = new Date();

      if (now > expiryDate) {
        return NextResponse.json(
          { error: "Short link has expired" },
          { status: 410 }, // Gone
        );
      }
    }

    // Collect analytics data
    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || null;
    const deviceType = getDeviceType(userAgent);

    // Track the click asynchronously (don't wait for it to complete)
    const trackClick = async () => {
      try {
        // Insert click record
        await supabase.from("short_link_clicks").insert({
          short_link_id: shortLink.id,
          ip_address: ip,
          user_agent: userAgent,
          referer,
          device_type: deviceType,
          clicked_at: new Date().toISOString(),
        });

        // Increment click count using the database function
        await supabase.rpc("increment_click_count", {
          link_id: shortLink.id,
        });
      } catch (error) {
        console.error("Failed to track click:", error);
        // Don't fail the redirect if analytics fail
      }
    };

    // Start tracking but don't wait for it
    trackClick();

    // Redirect to the original URL
    return NextResponse.redirect(shortLink.original_url, 302);
  } catch (error) {
    console.error("Short link redirect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// HEAD - Handle HEAD requests for link validation without tracking
export async function HEAD(
  request: NextRequest,
  { params }: { params: { code: string } },
) {
  try {
    const { code } = params;

    if (!code) {
      return new NextResponse(null, { status: 400 });
    }

    // Find the short link without tracking
    const { data: shortLink, error: fetchError } = await supabase
      .from("short_links")
      .select("original_url, expires_at, is_active")
      .eq("short_code", code)
      .eq("is_active", true)
      .single();

    if (fetchError || !shortLink) {
      return new NextResponse(null, { status: 404 });
    }

    // Check if link has expired
    if (shortLink.expires_at) {
      const expiryDate = new Date(shortLink.expires_at);
      const now = new Date();

      if (now > expiryDate) {
        return new NextResponse(null, { status: 410 });
      }
    }

    // Return success without redirect
    return new NextResponse(null, {
      status: 200,
      headers: {
        "X-Original-URL": shortLink.original_url,
      },
    });
  } catch (error) {
    console.error("Short link HEAD request error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
