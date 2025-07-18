import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import CategoryModel from "@/lib/models/category"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import redis from "@/lib/redis"

export async function GET(request: Request) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const categories = await CategoryModel.find({}).sort({ name: 1 })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, image } = body

    if (!name || !slug) {
      return NextResponse.json({ message: "Missing required fields (name, slug)" }, { status: 400 })
    }

    const existingCategory = await CategoryModel.findOne({ slug })
    if (existingCategory) {
      return NextResponse.json({ message: "Category with this slug already exists" }, { status: 409 })
    }

    const newCategory = await CategoryModel.create({
      name,
      slug,
      description,
      image,
    })

    // Invalidate category cache
    await redis.del("all_categories")
    await redis.del("all_categories_api")

    return NextResponse.json({ message: "Category created successfully", category: newCategory }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
