export const dynamic = "force-dynamic" // Force dynamic rendering for this route
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import OrderModel from "@/lib/models/order"
import ProductModel from "@/lib/models/product"
import UserModel from "@/lib/models/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Total Orders
    const totalOrders = await OrderModel.countDocuments({})

    // Total Products
    const totalProducts = await ProductModel.countDocuments({})

    // Total Users
    const totalUsers = await UserModel.countDocuments({})

    // Total Revenue (sum of totalPrice for delivered orders)
    const totalRevenueResult = await OrderModel.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ])
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0

    // Orders by Status
    const ordersByStatus = await OrderModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])

    // Latest Orders (e.g., last 5)
    const latestOrders = await OrderModel.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email") // Populate user details
      .lean()

    // Products by Category (example)
    const productsByCategory = await ProductModel.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])

    return NextResponse.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      ordersByStatus,
      latestOrders,
      productsByCategory,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
