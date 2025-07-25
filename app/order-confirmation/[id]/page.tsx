"use client";

import { useState, useEffect } from "react";
import { sendMetaConversionEvent } from "@/lib/analytics";
// Google Analytics purchase event
type OrderType = {
  id: string;
  total_amount: number;
  items?: Array<{
    product: { id: string; name: string };
    price: number;
    quantity: number;
  }>;
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

function fireGAPurchase(order: OrderType) {
  if (typeof window === "undefined" || typeof window.gtag !== "function")
    return;
  window.gtag("event", "purchase", {
    transaction_id: order.id,
    value: order.total_amount,
    currency: "BDT",
    items:
      order.items?.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      })) || [],
  });
}

// Meta Pixel purchase event
function fireMetaPixelPurchase(order: OrderType) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "Purchase", {
    value: order.total_amount,
    currency: "BDT",
    contents:
      order.items?.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      })) || [],
    content_type: "product",
    order_id: order.id,
  });
}
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Phone, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `,
        )
        .eq("order_number", orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order not found
            </h2>
            <p className="text-gray-600 mb-6">
              The order you're looking for doesn't exist
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fire purchase events on mount (only once)
  useEffect(() => {
    if (order) {
      fireGAPurchase(order);
      fireMetaPixelPurchase(order);
      sendMetaConversionEvent("Purchase", {
        event_id: order.id,
        value: order.total_amount,
        currency: "BDT",
        contents:
          order.items?.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
          })) || [],
        content_type: "product",
        order_id: order.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your order. We'll process it shortly.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Contact Information
                      </h4>
                      <p className="text-gray-600">{order.customer_name}</p>
                      <p className="text-gray-600">{order.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Delivery Address
                      </h4>
                      <p className="text-gray-600">{order.address}</p>
                      <p className="text-gray-600">
                        {order.district}, Bangladesh
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <Image
                        src={item.product.image_url || "/placeholder.svg"}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product.name}
                        </h4>
                        <p className="text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-gray-600">
                          Price: ৳{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>৳{(order.total_amount - 60).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span>৳60</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>৳{order.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {order.payment_method.toUpperCase()}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link href={`/track-order`}>
                    <Button className="w-full">Track Your Order</Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Order Processing
                </h4>
                <p className="text-sm text-gray-600">
                  We'll review and confirm your order within 24 hours
                </p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Preparation</h4>
                <p className="text-sm text-gray-600">
                  Your items will be carefully packed for delivery
                </p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Delivery</h4>
                <p className="text-sm text-gray-600">
                  Your order will be delivered to your address
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
