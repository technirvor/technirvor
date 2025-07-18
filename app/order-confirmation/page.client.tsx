"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import Image from "next/image"
import type { IOrder } from "@/lib/models/order"

export default function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const res = await fetch(`/api/admin/orders/${orderId}`) // Using admin API for simplicity, ideally a user-facing API
          if (res.ok) {
            const data = await res.json()
            setOrder(data)
          } else {
            setError("Order not found or failed to fetch.")
          }
        } catch (err) {
          setError("Failed to connect to server.")
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
      fetchOrder()
    } else {
      setError("No order ID provided.")
      setLoading(false)
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading order details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-3xl font-bold text-destructive">Error</h1>
        <p className="text-muted-foreground">{error}</p>
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-3xl font-bold text-destructive">Order Not Found</h1>
        <p className="text-muted-foreground">The order you are looking for could not be found.</p>
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card className="mx-auto max-w-3xl text-center">
        <CardHeader>
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
          <CardTitle className="text-3xl font-bold text-success">Order Confirmed!</CardTitle>
          <CardDescription>Thank you for your purchase. Your order has been successfully placed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-lg font-semibold">Order ID: {order._id.toString()}</p>
            <p className="text-muted-foreground">Placed On: {formatDateTime(order.createdAt)}</p>
            <p className="text-muted-foreground">Payment Method: {order.paymentMethod}</p>
            <p className="text-muted-foreground">
              Status: <span className="capitalize font-medium">{order.status}</span>
            </p>
          </div>

          <div className="border-t pt-4 space-y-4 text-left">
            <h3 className="text-xl font-semibold">Order Summary</h3>
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
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Items Price:</span>
                <span>{formatCurrency(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charge:</span>
                <span>{formatCurrency(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2 text-left">
            <h3 className="text-xl font-semibold">Shipping Address</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.district} - {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row justify-center pt-4 border-t">
            <Link href={`/track-order?orderId=${order._id.toString()}`}>
              <Button>Track Your Order</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
