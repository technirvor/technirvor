import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateApiKey, rateLimitCheck } from "@/lib/api-security";
import { notificationService } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    // Security checks
    const isValidKey = await validateApiKey(request);
    if (!isValidKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const identifier = `${ip}:${request.nextUrl.pathname}`;
    const rateLimitResult = await rateLimitCheck(
      identifier,
      100, // or your desired limit
      60, // or your desired window in seconds
    );
    if (!rateLimitResult.isAllowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      district,
      address,
      payment_method,
      items,
      total_amount,
    } = body;

    // Validate required fields
    if (
      !customer_name ||
      !customer_phone ||
      !district ||
      !address ||
      !items ||
      !total_amount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Bangladeshi phone number validation
    const isValidBangladeshiPhone = (phone: string) => {
      // Accepts 01410077761 or +8801410077761 (11 or 14 digits)
      const pattern = /^(\+8801|01)[3-9]\d{8}$/;
      return pattern.test(phone.trim());
    };
    if (!isValidBangladeshiPhone(customer_phone)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 },
      );
    }

    // Defensive check for items array
    type OrderItem = { product_id: string; quantity: number; price: number };
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }
    const productIds = (items as OrderItem[]).map((item) => item.product_id);
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "No product IDs found in order items" },
        { status: 400 },
      );
    }
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, stock, name")
      .in("id", productIds);

    if (productsError) {
      console.error("Supabase products fetch error:", productsError);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 },
      );
    }
    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "No products found for provided IDs" },
        { status: 400 },
      );
    }

    const missingIds = productIds.filter(
      (id: string) =>
        !products.some((product: { id: string }) => product.id === id),
    );
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: `Product(s) not found: ${missingIds.join(", ")}` },
        { status: 400 },
      );
    }

    for (const item of items as OrderItem[]) {
      const product = products.find(
        (p: { id: string; stock: number; name: string }) =>
          p.id === item.product_id,
      );
      if (!product) continue; // Already handled above
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          },
          { status: 400 },
        );
      }
    }

    // Generate order_number: TN-XX-XXXXXX
    function generateOrderNumber(district: string) {
      const prefix = "TN";
      const districtCode = (district || "XX").slice(0, 2).toUpperCase();
      const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6 digits
      return `${prefix}-${districtCode}-${randomNumber}`;
    }

    const order_number = generateOrderNumber(district);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number,
        customer_name,
        customer_phone,
        district,
        address,
        payment_method,
        total_amount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    // Create order items and update stock
    const orderItems = [];
    for (const item of items) {
      // Insert order item
      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })
        .select()
        .single();

      if (itemError) {
        console.error("Order item creation error:", itemError);
        return NextResponse.json(
          { error: "Failed to create order items" },
          { status: 500 },
        );
      }

      orderItems.push(orderItem);

      // Update product stock using the correct database function
      const { data: stockUpdateResult, error: stockError } = await supabase.rpc(
        "decrement_stock",
        {
          product_id: item.product_id,
          quantity: item.quantity,
        },
      );

      if (stockError || !stockUpdateResult) {
        console.error("Stock update error:", stockError);
        // Rollback order if stock update fails
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json(
          { error: "Failed to update stock" },
          { status: 500 },
        );
      }
    }

    // Add initial tracking note
    await supabase.from("order_tracking").insert({
      order_id: order.id,
      status: "pending",
      note: "Order placed successfully",
    });

    // Send notification to all admins
    await notificationService.notifyNewOrder(
      order.id,
      customer_name,
      total_amount,
    );

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: orderItems,
      },
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const isValidKey = await validateApiKey(request);
    if (!isValidKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") || "20"),
      100,
    );
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(
          *,
          product:products(*)
        ),
        tracking_notes:order_tracking(*)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`,
      );
    }

    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1,
    );

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      orders: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
