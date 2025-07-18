import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import ProductModel from "@/lib/models/product";

export async function POST(request: Request) {
  try {
    await connectToDB();
    const { productIds } = await request.json();
    const products = await ProductModel.find({ _id: { $in: productIds } }).select("_id");
    return NextResponse.json(products.map((p) => p._id.toString()));
  } catch (error) {
    console.error("Error validating products:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}