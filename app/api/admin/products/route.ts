import { NextResponse } from "next/server"
import ProductModel from "@/lib/models/product"
import { connectToDB } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: Request) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const query: any = {}
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const skip = (page - 1) * limit
    const products = await ProductModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 })
    const total = await ProductModel.countDocuments(query)

    return NextResponse.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, slug, description, price, oldPrice, category, brand, stock, images, featured, tags } =
      await request.json()

    if (!name || !slug || !description || !price || !category || !stock || !images || images.length === 0) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const existingProduct = await ProductModel.findOne({ slug })
    if (existingProduct) {
      return NextResponse.json({ message: "Product with this slug already exists" }, { status: 409 })
    }

    const newProduct = await ProductModel.create({
      name,
      slug,
      description,
      price,
      oldPrice,
      category,
      brand,
      stock,
      images,
      featured,
      tags,
    })
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
