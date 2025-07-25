import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") || "10"),
      20,
    );

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search products
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        price,
        sale_price,
        image_url,
        category:categories(name)
      `,
      )
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .gt("stock", 0)
      .limit(limit);

    if (error) throw error;

    // Search categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .ilike("name", `%${query}%`)
      .limit(5);

    if (catError) throw catError;

    return NextResponse.json({
      results: {
        products: products || [],
        categories: categories || [],
      },
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
