"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { IOrder } from "@/lib/models/order"
import OrderStatus from "@/lib/models/order"
import Image from "next/image"
import { useState, useEffect } from "react"

export default function TrackOrderPage() {
  const [orderIdInput, setOrderIdInput] = useState("")
  const [order, setOrder] = useState<IOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("orderId") || ""

  const fetchOrder = async (id: string) => {
    setIsLoading(true)
    setOrder(null) // Clear previous order data
    try {
      const res = await fetch(`/api/v1/orders/track?orderId=${id}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Order not found or failed to fetch.")
      }
      const data: IOrder = await res.json()
      setOrder(data)
      toast({
        title: "Order Found",
        description: `Details for order #${id.slice(-6)} loaded.`,
      })
    } catch (error: any) {
      console.error("Error fetching order:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to track order. Please check the ID.",
        variant: "destructive",
      })
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId)
    }
  }, [initialOrderId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderIdInput) {
      fetchOrder(orderIdInput)
    } else {
      toast({
        title: "Missing Order ID",
        description: "Please enter an order ID to track.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: IOrder["status"]) => {
    switch (status) {
      case "pending":
      case "processing":
        return <Package className="h-6 w-6 text-blue-500" />
      case "shipped":
        return <Truck className="h-6 w-6 text-yellow-500" />
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Package className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Track Your Order</h1>

      <Card className="max-w-xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Enter Order ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter your order ID"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && order && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(order.status)} Order #{order._id?.toString().slice(-6)}
            </CardTitle>
            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Current Status:</h3>
              <p className="text-lg font-bold capitalize">{order.status}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Shipping Information:</h3>
              <p>
                <strong>Name:</strong> {order.shippingAddress.fullName}
              </p>
              <p>
                <strong>Address:</strong> {order.shippingAddress.address},{" "}
                {order.shippingAddress.district}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Order Summary:</h3>
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div key={item.product?.toString()} className="flex items-center gap-4">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} x {item.quantity} = {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mt-4 space-y-1">
                <div className="flex justify-between">
                  <span>Items Total:</span>
                  <span>{formatCurrency(order.itemsPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span>{formatCurrency(order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !order && orderIdInput && (
        <div className="text-center text-gray-600 py-10">No order found with that ID. Please try again.</div>
      )}
    </main>
  )
}
