import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { validateApiKey, rateLimitCheck } from "@/lib/api-security";
import { nanoid } from "nanoid";

// Generate a unique short code
function generateShortCode(): string {
  return nanoid(8); // 8 character short code
}

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// POST - Create a new short link
export async function POST(request: NextRequest) {
  try {
    // Security checks
    const apiKeyResult = validateApiKey(request);
    if (!apiKeyResult.isValid) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const identifier = `${ip}:${request.nextUrl.pathname}`;
    const rateLimitResult = await rateLimitCheck(
      identifier,
      50, // 50 requests per minute
      60, // 60 seconds window
    );
    if (!rateLimitResult.isAllowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    // Use service role client for admin operations
    const supabase = createServerClient();

    const body = await request.json();
    const { original_url, title, description, expires_at, created_by } = body;

    // Validate required fields
    if (!original_url) {
      return NextResponse.json(
        { error: "original_url is required" },
        { status: 400 },
      );
    }

    // Validate URL format
    if (!isValidUrl(original_url)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Generate unique short code
    let short_code = generateShortCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure short code is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from("short_links")
        .select("id")
        .eq("short_code", short_code)
        .single();

      if (!existing) {
        break; // Short code is unique
      }

      short_code = generateShortCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique short code" },
        { status: 500 },
      );
    }

    // Create short link
    const { data: shortLink, error: createError } = await supabase
      .from("short_links")
      .insert({
        short_code,
        original_url,
        title: title || null,
        description: description || null,
        expires_at: expires_at || null,
        created_by: created_by || null,
        is_active: true,
        click_count: 0,
      })
      .select()
      .single();

    if (createError) {
      console.error("Short link creation error:", createError);
      return NextResponse.json(
        { error: "Failed to create short link" },
        { status: 500 },
      );
    }

    // Return the created short link with full URL
    const baseUrl = request.nextUrl.origin;
    const shortUrl = `${baseUrl}/s/${short_code}`;

    return NextResponse.json({
      id: shortLink.id,
      short_code,
      short_url: shortUrl,
      original_url,
      title: shortLink.title,
      description: shortLink.description,
      expires_at: shortLink.expires_at,
      created_at: shortLink.created_at,
      click_count: shortLink.click_count,
      is_active: shortLink.is_active,
    });
  } catch (error) {
    console.error("Short link creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET - List user's short links with analytics
export async function GET(request: NextRequest) {
  try {
    // Security checks
    const apiKeyResult = validateApiKey(request);
    if (!apiKeyResult.isValid) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Use service role client for admin operations
    const supabase = createServerClient();

    const { searchParams } = new URL(request.url);
    const created_by = searchParams.get("created_by");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("short_links")
      .select(
        `
        id,
        short_code,
        original_url,
        title,
        description,
        created_at,
        updated_at,
        expires_at,
        click_count,
        is_active,
        created_by
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by creator if specified
    if (created_by) {
      query = query.eq("created_by", created_by);
    }

    const { data: shortLinks, error: fetchError } = await query;

    if (fetchError) {
      console.error("Short links fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch short links" },
        { status: 500 },
      );
    }

    // Add full short URLs to response
    const baseUrl = request.nextUrl.origin;
    const shortLinksWithUrls = shortLinks?.map((link) => ({
      ...link,
      short_url: `${baseUrl}/s/${link.short_code}`,
    }));

    return NextResponse.json({
      short_links: shortLinksWithUrls,
      page,
      limit,
      total: shortLinksWithUrls?.length || 0,
    });
  } catch (error) {
    console.error("Short links fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a short link
export async function DELETE(request: NextRequest) {
  try {
    // Security checks
    const apiKeyResult = validateApiKey(request);
    if (!apiKeyResult.isValid) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Use service role client for admin operations
    const supabase = createServerClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const created_by = searchParams.get("created_by");

    if (!id) {
      return NextResponse.json(
        { error: "Short link ID is required" },
        { status: 400 },
      );
    }

    // Build delete query
    let deleteQuery = supabase.from("short_links").delete().eq("id", id);

    // If created_by is provided, ensure user can only delete their own links
    if (created_by) {
      deleteQuery = deleteQuery.eq("created_by", created_by);
    }

    const { data, error: deleteError } = await deleteQuery.select();

    if (deleteError) {
      console.error("Short link deletion error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete short link" },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Short link not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Short link deleted successfully",
      deleted_id: id,
    });
  } catch (error) {
    console.error("Short link deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
