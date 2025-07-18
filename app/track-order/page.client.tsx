"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Package, CheckCircle, XCircle, Truck, Clock } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import Image from "next/image"
import type { IOrder } from "@/lib/models/order"
import Link from "next/link"

export default function TrackOrderContent() {
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("orderId") || ""
  const [orderId, setOrderId] = useState(initialOrderId)
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrderDetails = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/track?orderId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Order not found.")
        setOrder(null)
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again later.")
      setOrder(null)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialOrderId) {
      fetchOrderDetails(initialOrderId)
    }
  }, [initialOrderId])

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderId.trim()) {
      fetchOrderDetails(orderId.trim())
    } else {
      setError("Please enter an Order ID.")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "processing":
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      case "shipped":
        return <Truck className="h-6 w-6 text-indigo-500" />
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Package className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold text-center">Track Your Order</h1>
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Enter Order ID</CardTitle>
          <CardDescription>Enter the order ID you received in your confirmation email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="flex gap-2">
            <Label htmlFor="orderId" className="sr-only">
              Order ID
            </Label>
            <Input
              id="orderId"
              placeholder="e.g., 65c7b9d0e1f2a3b4c5d6e7f8"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track Order"}
            </Button>
          </form>
          {error && <p className="mt-4 text-center text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {order && (
        <Card className="mx-auto mt-8 max-w-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Order Details</CardTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className="text-lg font-semibold capitalize">{order.status}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID:</p>
                <p className="font-medium">{order._id.toString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date:</p>
                <p className="font-medium">{formatDateTime(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method:</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount:</p>
                <p className="font-medium">{formatCurrency(order.totalPrice)}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-xl font-semibold">Items in Order</h3>
              {order.orderItems.map((item) => (
                <div key={item.product.toString()} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="text-xl font-semibold">Shipping Address</h3>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.district} - {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>

            <div className="flex justify-center pt-4 border-t">
              <Link href="/my-orders">
                <Button variant="outline">View All My Orders</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
