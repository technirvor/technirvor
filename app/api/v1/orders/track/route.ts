export const dynamic = "force-dynamic" // Force dynamic rendering for this route
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import OrderModel from "@/lib/models/order"
import { isValidObjectId } from "mongoose"

export async function GET(request: Request) {
  try {
    await connectToDB()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 })
    }

    if (!isValidObjectId(orderId)) {
      return NextResponse.json({ message: "Invalid Order ID format" }, { status: 400 })
    }

    const order = await OrderModel.findById(orderId)

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error tracking order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
