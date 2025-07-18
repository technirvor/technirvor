export const dynamic = "force-dynamic" // Force dynamic rendering for this route
import { NextResponse } from "next/server"
import OrderModel from "@/lib/models/order"
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
    const status = searchParams.get("status") || ""
    const search = searchParams.get("search") || "" // Search by order ID or customer name

    const query: any = {}
    if (status) {
      query.status = status
    }
    if (search) {
      // Search by order ID (partial match) or customer name
      query.$or = [
        { _id: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit
    const orders = await OrderModel.find(query)
      .populate("user", "name email") // Populate user details
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await OrderModel.countDocuments(query)

    return NextResponse.json({ orders, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
