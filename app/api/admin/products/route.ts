import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateRequest } from "@/lib/api-security";

// Use validateRequest for admin access
async function validateAdminAccess(request: NextRequest) {
  return validateRequest(request, { requireAdmin: true });
}

// Basic input sanitizer stub
function sanitizeInput(data: any) {
  // Add real sanitization logic as needed
  return data;
}

// Basic product data validator stub
function validateProductData(data: any) {
  // Add real validation logic as needed
  return { isValid: true, errors: [] };
}
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
  try {
    const { isValid, error } = await validateAdminAccess(request);
    if (!isValid) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") || "20"),
      100,
    ); // Max 100 items
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    let query = supabase.from("products").select(
      `
        *,
        category:categories(*)
      `,
      { count: "exact" },
    );

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (category && category !== "all") {
      query = query.eq("category_id", category);
    }

    const {
      data,
      error: fetchError,
      count,
    } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (fetchError) throw fetchError;

    return NextResponse.json({
      products: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isValid, error } = await validateAdminAccess(request);
    if (!isValid) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const sanitizedData = sanitizeInput(body);

    const { isValid: isDataValid, errors } = validateProductData(sanitizedData);
    if (!isDataValid) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 },
      );
    }

    const { data, error: insertError } = await supabase
      .from("products")
      .insert(sanitizedData)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
