import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import OrderModel from "@/lib/models/order";
import ProductModel from "@/lib/models/product";
import DistrictModel from "@/lib/models/district";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: Request) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { user, orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = body;

    // Validate required fields
    if (
      !orderItems ||
      orderItems.length === 0 ||
      !shippingAddress ||
      !paymentMethod ||
      itemsPrice === undefined ||
      shippingPrice === undefined ||
      totalPrice === undefined
    ) {
      return NextResponse.json({ message: "Missing required order details" }, { status: 400 });
    }

    // Validate product stock and prices
    for (const item of orderItems) {
      const product = await ProductModel.findById(item.product);
      if (!product) {
        console.log(`Product not found for ID: ${item.product}, Name: ${item.name}`);
        return NextResponse.json({ message: `Product not found: ${item.name}` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `Insufficient stock for product: ${item.name}` }, { status: 400 });
      }
      if (product.price !== item.price) {
        return NextResponse.json({ message: `Price mismatch for product: ${item.name}` }, { status: 400 });
      }
    }

    // Validate shipping district and charge
    const district = await DistrictModel.findOne({ name: shippingAddress.district });
    if (!district) {
      return NextResponse.json({ message: "Invalid or inactive delivery district" }, { status: 400 });
    }
    if (district.deliveryCharge !== shippingPrice) {
      return NextResponse.json({ message: "Shipping charge mismatch for selected district" }, { status: 400 });
    }

    // Create the order
    const newOrder = await OrderModel.create({
      user: (session && 'id' in (session.user ?? {})) ? (session.user as any).id : null, // Use null for guest orders
      orderItems: orderItems.map((item: any) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || "", // Fallback for image
        slug: item.slug,
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName, // Use fullName from request
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        district: shippingAddress.district,
        city: shippingAddress.city || "", // Optional
        postalCode: shippingAddress.postalCode || "", // Optional
        country: shippingAddress.country || "Bangladesh", // Default
      },
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentMethod === "Cash on Delivery" ? false : true,
      status: "pending",
    });

    // Decrease product stock
    for (const item of orderItems) {
      await ProductModel.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    return NextResponse.json({ message: "Order placed successfully", orderId: newOrder._id }, { status: 201 });
  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}