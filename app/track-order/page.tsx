"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import { toast } from "sonner";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId.trim() || !phone.trim()) {
      toast.error("Please enter both Order ID and Phone Number");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          tracking_notes:order_tracking(*)
        `,
        )
        .eq("order_number", orderId)
        .eq("customer_phone", phone)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          toast.error(
            "Order not found. Please check your Order ID and Phone Number.",
          );
        } else {
          throw error;
        }
        setOrder(null);
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to fetch order details");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-orange-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Track Your Order
        </h1>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter your order ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? "Searching..." : "Track Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order #{order.id}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Customer Information
                    </h3>
                    <p className="text-gray-600">Name: {order.customer_name}</p>
                    <p className="text-gray-600">
                      Phone: {order.customer_phone}
                    </p>
                    <p className="text-gray-600">District: {order.district}</p>
                    <p className="text-gray-600">Address: {order.address}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Order Details
                    </h3>
                    <p className="text-gray-600">
                      Order Date:{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Payment: {order.payment_method.toUpperCase()}
                    </p>
                    <p className="text-gray-600">
                      Total: ৳{order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <img
                        src={item.product.image_url || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
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

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.tracking_notes?.map((note, index) => (
                    <div key={note.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(note.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {note.status.charAt(0).toUpperCase() +
                              note.status.slice(1)}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(note.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{note.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
