import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = createServerClient();

  const {
    productId,
    orderNumber,
    phoneNumber,
    reviewText,
    reviewImages,
    rating,
  } = await request.json();

  if (
    !productId ||
    !orderNumber ||
    !phoneNumber ||
    !reviewText ||
    rating === undefined
  ) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 },
    );
  }

  // Validate image formats and count
  const allowedImageTypes = ["image/jpeg", "image/png"];
  if (reviewImages && reviewImages.length > 5) {
    return NextResponse.json(
      { error: "Maximum 5 images allowed." },
      { status: 400 },
    );
  }
  if (
    reviewImages &&
    reviewImages.some((url: string) => {
      // A simple check, ideally you'd validate the actual file type on upload
      const extension = url.split(".").pop()?.toLowerCase();
      return !["jpg", "jpeg", "png"].includes(extension || "");
    })
  ) {
    return NextResponse.json(
      { error: "Only JPG and PNG images are allowed." },
      { status: 400 },
    );
  }

  try {
    // 1. Verify Order Number and Phone Number match for the product
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, order_items!inner(product_id)")
      .eq("order_number", orderNumber)
      .eq("customer_phone", phoneNumber) // Corrected column name
      .single();

    if (orderError || !orderData) {
      console.error("Order verification error:", orderError);
      return NextResponse.json(
        {
          error: "Order number and phone number do not match any valid order.",
        },
        { status: 403 },
      );
    }

    // Check if the product is part of this order
    const productInOrder =
      orderData.order_items &&
      orderData.order_items.some(
        (item: { product_id: string }) => item.product_id === productId,
      );

    if (!productInOrder) {
      return NextResponse.json(
        { error: "This order number is not associated with this product." },
        { status: 403 },
      );
    }

    // 2. Check if a review already exists for this order number
    const { data: existingReview, error: reviewCheckError } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_number", orderNumber)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "A review for this order number already exists." },
        { status: 409 },
      );
    }

    if (reviewCheckError && reviewCheckError.code !== "PGRST116") {
      // PGRST116 means no rows found
      console.error("Review check error:", reviewCheckError);
      return NextResponse.json(
        { error: "Failed to check for existing review." },
        { status: 500 },
      );
    }

    // 3. Insert the new review
    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        order_number: orderNumber,
        phone_number: phoneNumber,
        review_text: reviewText,
        review_images: reviewImages,
        rating: rating,
        // You might want to add user_id if you have authentication
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting review:", insertError);
      return NextResponse.json(
        { error: "Failed to submit review." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Review submitted successfully!", review: newReview },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Unexpected error in review API:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
