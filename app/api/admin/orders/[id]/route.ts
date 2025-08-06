import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateRequest } from "@/lib/api-security";

// Use service role key for admin operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Use validateRequest for admin access
async function validateAdminAccess(request: NextRequest) {
  return validateRequest(request, { requireAdmin: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { isValid, error } = await validateAdminAccess(request);
    if (!isValid) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    // Delete order items first (due to foreign key constraint)
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error deleting order items:", itemsError);
      return NextResponse.json(
        { error: "Failed to delete order items" },
        { status: 500 },
      );
    }

    // Delete order tracking records
    const { error: trackingError } = await supabaseAdmin
      .from("order_tracking")
      .delete()
      .eq("order_id", orderId);

    if (trackingError) {
      console.error("Error deleting order tracking:", trackingError);
      // Continue even if tracking deletion fails
    }

    // Delete the main order
    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      console.error("Error deleting order:", orderError);
      return NextResponse.json(
        { error: "Failed to delete order" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Order deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Order deletion API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
