"use client"

import Link from "next/link"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { IOrder } from "@/lib/models/order"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import Image from "next/image"

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const orderId = React.use(params).id
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(true) // Initial loading for fetching order
  const [submitting, setSubmitting] = useState(false) // For form submission
  const [status, setStatus] = useState<IOrder["status"]>("pending")
  const [isPaid, setIsPaid] = useState(false)
  const [isDelivered, setIsDelivered] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`)
        if (res.ok) {
          const orderData: IOrder = await res.json()
          setOrder(orderData)
          setStatus(orderData.status)
          setIsPaid(orderData.isPaid)
          setIsDelivered(orderData.isDelivered)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch order data.",
            variant: "destructive",
          })
          router.push("/admin/orders") // Redirect if order not found
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Network error or server issue while fetching order data.",
          variant: "destructive",
        })
        console.error("Error fetching order data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrderData()
  }, [orderId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, isPaid, isDelivered }),
      })

      if (res.ok) {
        toast({
          title: "Order Updated",
          description: "Order details have been updated successfully.",
          variant: "default",
        })
        router.push("/admin/orders")
      } else {
        const errorData = await res.json()
        toast({
          title: "Update Failed",
          description: errorData.message || "Failed to update order.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Network error or server issue.",
        variant: "destructive",
      })
      console.error("Error updating order:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading order data...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-3xl font-bold text-destructive">Order Not Found</h1>
        <p className="text-muted-foreground">The order you are looking for could not be found.</p>
        <Link href="/admin/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Order #{order._id.toString().slice(-8)}</CardTitle>
          <CardDescription>Update the status and details for this order.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Information</h3>
              <p>
                <strong>Customer:</strong> {(order.user as any)?.name || order.shippingAddress.fullName}
              </p>
              <p>
                <strong>Email:</strong> {(order.user as any)?.email || order.shippingAddress.fullName}
              </p>{" "}
              {/* Assuming email is same as full name for guest */}
              <p>
                <strong>Order Date:</strong> {formatDateTime(order.createdAt)}
              </p>
              <p>
                <strong>Payment Method:</strong> {order.paymentMethod}
              </p>
              <p>
                <strong>Items Price:</strong> {formatCurrency(order.itemsPrice)}
              </p>
              <p>
                <strong>Shipping Price:</strong> {formatCurrency(order.shippingPrice)}
              </p>
              <p className="text-xl font-bold">
                <strong>Total Price:</strong> {formatCurrency(order.totalPrice)}
              </p>
              <h3 className="text-lg font-semibold mt-4">Shipping Address</h3>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.district} - {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <h3 className="text-lg font-semibold mt-4">Order Items</h3>
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div key={item.product.toString()} className="flex items-center gap-3">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} | {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold">Update Order Status</h3>
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as IOrder["status"])}
                  disabled={submitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                  disabled={submitting}
                />
                <Label htmlFor="isPaid">Mark as Paid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDelivered"
                  checked={isDelivered}
                  onChange={(e) => setIsDelivered(e.target.checked)}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                  disabled={submitting}
                />
                <Label htmlFor="isDelivered">Mark as Delivered</Label>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Order...
                  </>
                ) : (
                  "Update Order"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
