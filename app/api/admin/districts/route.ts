import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import DistrictModel from "@/lib/models/district"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import redis from "@/lib/redis"

export async function GET(request: Request) {
  try {
    await connectToDB()

    const districts = await DistrictModel.find({}).sort({ name: 1 })
    return NextResponse.json(districts)
  } catch (error) {
    console.error("Error fetching districts:", error)
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
    const { name, deliveryCharge, isActive } = body

    if (!name || deliveryCharge === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const existingDistrict = await DistrictModel.findOne({ name })
    if (existingDistrict) {
      return NextResponse.json({ message: "District with this name already exists" }, { status: 409 })
    }

    const newDistrict = await DistrictModel.create({
      name,
      deliveryCharge,
      isActive: isActive ?? true,
    })

    // Invalidate relevant caches
    await redis.del("all_districts_api") // If you have a public API for districts
    await redis.del("all_products_page_*") // If product prices depend on delivery charges

    return NextResponse.json({ message: "District created successfully", district: newDistrict }, { status: 201 })
  } catch (error) {
    console.error("Error creating district:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
