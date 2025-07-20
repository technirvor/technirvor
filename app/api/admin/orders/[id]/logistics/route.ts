import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import OrderModel from "@/lib/models/order"
import { getServerSession } from "next-auth"
import { isValidObjectId } from "mongoose"
import { authOptions } from "@/lib/auth-options"

import { LogisticsManager, type LogisticsProvider } from "@/lib/logistics"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { logisticsService } = body

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    if (!logisticsService || !["pathao", "steadfast", "redx"].includes(logisticsService)) {
      return NextResponse.json({ message: "Invalid logistics service" }, { status: 400 })
    }

    // Fetch the order with populated user data
    const order = await OrderModel.findById(id).populate("user", "name email phone")

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Check if order is already sent to logistics
    if (order.logisticsService) {
      return NextResponse.json(
        { message: `Order already sent to ${order.logisticsService}` },
        { status: 400 }
      )
    }

    let logisticsResponse
    let trackingId = null

    try {
      // Use shared LogisticsManager for all providers
      const logisticsManager = new LogisticsManager()
      const provider = logisticsService as LogisticsProvider
      logisticsResponse = await logisticsManager.sendOrderToProvider(order, provider)
      trackingId = logisticsResponse.trackingId

      if (!logisticsResponse.success) {
        return NextResponse.json(
          { message: `Failed to send order to ${provider}: ${logisticsResponse.message}` },
          { status: 500 }
        )
      }

      // Update the order with logistics information
      const updateFields: any = {
        logisticsService: provider,
        trackingId,
        logisticsResponse: JSON.stringify(logisticsResponse.providerResponse),
        sentToLogisticsAt: new Date(),
      }

      // If not already shipped, update status to shipped
      if (order.status === "pending" || order.status === "processing") {
        updateFields.status = "shipped"
      }

      const updatedOrder = await OrderModel.findByIdAndUpdate(id, updateFields, { new: true })

      return NextResponse.json({
        message: `Order successfully sent to ${provider}`,
        trackingId,
        logisticsService: provider,
        order: updatedOrder,
      })
    } catch (logisticsError: any) {
      console.error(`Error sending to ${logisticsService}:`, logisticsError)

      // Check if it's a configuration error
      if (typeof logisticsError.message === "string" && logisticsError.message.includes("not configured")) {
        return NextResponse.json(
          { message: `${logisticsService} service is not configured. Please contact administrator.` },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { message: `Failed to send order to ${logisticsService}: ${logisticsError.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in logistics route:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// GET method to retrieve logistics status
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    const order = await OrderModel.findById(id).select("logisticsService trackingId sentToLogisticsAt")

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      logisticsService: order.logisticsService || null,
      trackingId: order.trackingId || null,
      sentToLogisticsAt: order.sentToLogisticsAt || null,
    })
  } catch (error) {
    console.error("Error fetching logistics status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}