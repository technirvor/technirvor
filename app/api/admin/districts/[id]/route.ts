import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import DistrictModel from "@/lib/models/district"
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

    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid district ID" }, { status: 400 })
    }

    const district = await DistrictModel.findById(id)

    if (!district) {
      return NextResponse.json({ message: "District not found" }, { status: 404 })
    }

    return NextResponse.json(district)
  } catch (error) {
    console.error("Error fetching district by ID:", error)
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

    const { id } = params
    const body = await request.json()
    const { name, deliveryCharge, isActive } = body

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid district ID" }, { status: 400 })
    }

    if (!name || deliveryCharge === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const existingDistrict = await DistrictModel.findOne({ name, _id: { $ne: id } })
    if (existingDistrict) {
      return NextResponse.json({ message: "District with this name already exists" }, { status: 409 })
    }

    const updatedDistrict = await DistrictModel.findByIdAndUpdate(
      id,
      {
        name,
        deliveryCharge,
        isActive: isActive ?? true,
      },
      { new: true },
    )

    if (!updatedDistrict) {
      return NextResponse.json({ message: "District not found" }, { status: 404 })
    }

    // Invalidate relevant caches
    await redis.del("all_districts_api") // If you have a public API for districts
    await redis.del("all_products_page_*") // If product prices depend on delivery charges

    return NextResponse.json({ message: "District updated successfully", district: updatedDistrict })
  } catch (error) {
    console.error("Error updating district:", error)
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

    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid district ID" }, { status: 400 })
    }

    const deletedDistrict = await DistrictModel.findByIdAndDelete(id)

    if (!deletedDistrict) {
      return NextResponse.json({ message: "District not found" }, { status: 404 })
    }

    // Invalidate relevant caches
    await redis.del("all_districts_api") // If you have a public API for districts
    await redis.del("all_products_page_*") // If product prices depend on delivery charges

    return NextResponse.json({ message: "District deleted successfully" })
  } catch (error) {
    console.error("Error deleting district:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
