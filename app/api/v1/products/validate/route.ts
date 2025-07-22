import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import ProductModel from "@/lib/models/product";


export async function POST(request: Request) {
  try {
    await connectToDB();
    const { productIds } = await request.json();
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ message: "productIds must be a non-empty array" }, { status: 400 });
    }
    const products = await ProductModel.find({ _id: { $in: productIds } }).select("_id");
    const validIds = products.map((p) => p._id.toString());
    return NextResponse.json(validIds);
  } catch (error) {
    console.error("Error validating products:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}