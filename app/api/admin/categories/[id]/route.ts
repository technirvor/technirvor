import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import CategoryModel from "@/lib/models/category"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import redis from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const category = await CategoryModel.findById(id)

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category by ID:", error)
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
    const { name, slug, description, image } = body

    if (!name || !slug) {
      return NextResponse.json({ message: "Missing required fields (name, slug)" }, { status: 400 })
    }

    const existingCategory = await CategoryModel.findOne({ slug, _id: { $ne: id } })
    if (existingCategory) {
      return NextResponse.json({ message: "Category with this slug already exists" }, { status: 409 })
    }

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      { name, slug, description, image },
      { new: true }
    )

    if (!updatedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    // Invalidate category cache
    await redis.del("all_categories")
    await redis.del("all_categories_api")

    return NextResponse.json({ message: "Category updated successfully", category: updatedCategory }, { status: 200 })
  } catch (error) {
    console.error("Error updating category:", error)
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

    const deletedCategory = await CategoryModel.findByIdAndDelete(id)

    if (!deletedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    // Invalidate category cache
    await redis.del("all_categories")
    await redis.del("all_categories_api")

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}