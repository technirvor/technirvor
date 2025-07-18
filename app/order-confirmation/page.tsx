"use client"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import type { IOrder } from "@/lib/models/order"
import { useState, useEffect } from "react"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const { toast } = useToast()

  const [order, setOrder] = useState<IOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.")
      setIsLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/v1/orders/track?orderId=${orderId}`)
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || "Failed to fetch order details.")
        }
        const data: IOrder = await res.json()
        setOrder(data)
      } catch (err: any) {
        console.error("Error fetching order details:", err)
        setError(err.message || "Could not load order details.")
        toast({
          title: "Error",
          description: err.message || "Failed to load order details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, toast])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-600">Loading your order details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Order Not Found or Error</h1>
        <p className="text-lg text-gray-700 mb-8">{error}</p>
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Order Not Found</h1>
        <p className="text-lg text-gray-700 mb-8">The order you are looking for does not exist.</p>
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Order Confirmed!</CardTitle>
          <p className="text-gray-600">Thank you for your purchase.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Your order number is: <span className="font-semibold">{order._id?.toString()}</span>
          </p>
          <p className="text-lg">
            Total Amount: <span className="font-semibold">{formatCurrency(order.totalPrice)}</span>
          </p>
          <p className="text-gray-700">You will receive an email confirmation shortly with details of your order.</p>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-xl font-semibold mb-2">Shipping Details</h3>
            <p>
              <strong>Name:</strong> {order.shippingAddress.fullName}
            </p>
            <p>
              <strong>Address:</strong> {order.shippingAddress.address},{" "}
              {order.shippingAddress.district}
            </p>
            <p>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <Link href="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Link href={`/track-order?orderId=${order._id}`}>
              <Button>Track Order</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
