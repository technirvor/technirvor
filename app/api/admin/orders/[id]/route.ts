import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import OrderModel from "@/lib/models/order"
import { getServerSession } from "next-auth"
import { isValidObjectId } from "mongoose"
import { authOptions } from "@/lib/auth-options"

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

    const order = await OrderModel.findById(id).populate("user", "name email")

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order by ID:", error)
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
    const { status, isPaid, isDelivered, logisticsService, trackingId } = body

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    const updateFields: any = {}
    if (status) updateFields.status = status
    if (typeof isPaid === "boolean") updateFields.isPaid = isPaid
    if (typeof isDelivered === "boolean") updateFields.isDelivered = isDelivered
    if (logisticsService) updateFields.logisticsService = logisticsService
    if (trackingId) updateFields.trackingId = trackingId

    // Set paidAt/deliveredAt timestamps if status changes
    if (isPaid && !body.paidAt) updateFields.paidAt = new Date()
    if (isDelivered && !body.deliveredAt) updateFields.deliveredAt = new Date()

    const updatedOrder = await OrderModel.findByIdAndUpdate(id, updateFields, { new: true })

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Order updated successfully", order: updatedOrder })
  } catch (error) {
    console.error("Error updating order:", error)
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
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    const deletedOrder = await OrderModel.findByIdAndDelete(id)

    if (!deletedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}