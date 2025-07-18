import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import ProductModel from "@/lib/models/product"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { isValidObjectId } from "mongoose"
import redis from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const product = await ProductModel.findById(id)

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, slug, description, price, oldPrice, category, brand, stock, images, featured, tags } = body

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    if (!name || !slug || !description || !price || !category || !stock || !images || images.length === 0) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const existingProduct = await ProductModel.findOne({ slug, _id: { $ne: id } })
    if (existingProduct) {
      return NextResponse.json({ message: "Product with this slug already exists" }, { status: 409 })
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description,
        price,
        oldPrice: oldPrice || null,
        category,
        brand,
        stock,
        images,
        featured: featured || false,
        tags,
      },
      { new: true },
    )

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Invalidate relevant caches
    await redis.del("featured_products")
    await redis.del("all_products_page_*") // Invalidate all product list caches
    await redis.del(`product_slug_${updatedProduct.slug}`) // Invalidate specific product cache
    await redis.del(`related_products_cat_${updatedProduct.category}_id_*`) // Invalidate related products cache

    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const deletedProduct = await ProductModel.findByIdAndDelete(id)

    if (!deletedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Invalidate relevant caches
    await redis.del("featured_products")
    await redis.del("all_products_page_*") // Invalidate all product list caches
    await redis.del(`product_slug_${deletedProduct.slug}`) // Invalidate specific product cache
    await redis.del(`related_products_cat_${deletedProduct.category}_id_*`) // Invalidate related products cache

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
