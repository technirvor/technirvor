"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Copy, Save } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Order, TrackingNote } from "@/lib/types";

interface OrderDetailsClientProps {
  order: Order;
  trackingNotes: TrackingNote[];
}

export default function OrderDetailsClient({
  order,
  trackingNotes,
}: OrderDetailsClientProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(order.status);
  const [newNote, setNewNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState(trackingNotes);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleStatusChange = (value: string) => {
    setCurrentStatus(value);
  };

  const handleStatusUpdate = async () => {
    if (currentStatus === order.status && !newNote.trim()) {
      toast.error("No changes to update");
      return;
    }

    setIsUpdating(true);
    try {
      // Update order status if changed
      if (currentStatus !== order.status) {
        const { error: orderError } = await supabase
          .from("orders")
          .update({ status: currentStatus })
          .eq("id", order.id);

        if (orderError) throw orderError;
      }

      // Add tracking note if provided
      if (newNote.trim()) {
        const { data: noteData, error: noteError } = await supabase
          .from("order_tracking")
          .insert({
            order_id: order.id,
            note: newNote.trim(),
            status: currentStatus,
          })
          .select()
          .single();

        if (noteError) throw noteError;

        // Add the new note to the local state
        setNotes([...notes, noteData]);
        setNewNote("");
      }

      toast.success("Order updated successfully!");
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Button asChild>
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Order Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-base">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Order Number:</span>{" "}
            <span className="font-mono text-gray-900">
              {order.order_number}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(order.order_number);
                toast.success("Order Number copied!");
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Order ID:</span>{" "}
            <span className="font-mono text-gray-900">{order.id}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(order.id);
                toast.success("Order ID copied!");
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Customer Name:</span>{" "}
            {order.customer_name}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(order.customer_name);
                toast.success("Customer Name copied!");
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {order.customer_email && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Customer Email:</span>{" "}
              {order.customer_email}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(order.customer_email!);
                  toast.success("Customer Email copied!");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Customer Phone:</span>{" "}
            {order.customer_phone}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(order.customer_phone);
                toast.success("Customer Phone copied!");
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <span className="font-semibold">Status:</span>{" "}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.status === "delivered" 
                ? "bg-green-100 text-green-800"
                : order.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : order.status === "confirmed"
                ? "bg-blue-100 text-blue-800"
                : order.status === "processing"
                ? "bg-purple-100 text-purple-800"
                : order.status === "shipped"
                ? "bg-indigo-100 text-indigo-800"
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div>
            <span className="font-semibold">Created At:</span>{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            ,{" "}
            {new Date(order.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </div>
          <div>
            <span className="font-semibold">District:</span> {order.district}
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center gap-2">
            <span className="font-semibold">Address:</span> {order.address}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(order.address);
                toast.success("Address copied!");
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {order.shipping_address && (
            <div className="col-span-1 md:col-span-2 flex items-center gap-2">
              <span className="font-semibold">Shipping Address:</span>{" "}
              {order.shipping_address}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(order.shipping_address!);
                  toast.success("Shipping Address copied!");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card className="shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-base">
          <div>
            <span className="font-semibold">Payment Method:</span>{" "}
            {order.payment_method === "COD" || order.payment_method === "cod"
              ? "Cash On Delivery"
              : order.payment_method.toUpperCase()}
          </div>
          <div>
            <span className="font-semibold">Total Amount:</span> ৳
            {order.total_amount?.toFixed(2)}
          </div>
          {order.transaction_id && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Transaction ID:</span>{" "}
              <span className="font-mono text-gray-900">{order.transaction_id}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(order.transaction_id!);
                  toast.success("Transaction ID copied!");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div>
            <span className="font-semibold">Payment Status:</span>{" "}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.status === "delivered" 
                ? "bg-green-100 text-green-800"
                : order.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : order.payment_method === "cod" || order.payment_method === "COD"
                ? "bg-yellow-100 text-yellow-800"
                : order.transaction_id
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {order.status === "delivered" 
                ? "Paid"
                : order.status === "cancelled"
                ? "Cancelled"
                : order.payment_method === "cod" || order.payment_method === "COD"
                ? "Pay on Delivery"
                : order.transaction_id
                ? "Paid"
                : "Pending"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card className="shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Update Order Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Add Tracking Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Enter tracking note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <Button 
            onClick={handleStatusUpdate} 
            disabled={isUpdating || (currentStatus === order.status && !newNote.trim())}
            className="w-full md:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? "Updating..." : "Update Order"}
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card className="shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/product/${item.product?.slug}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      {item.product?.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      {item.product?.name}
                    </Link>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ৳{item.product?.price?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ৳{(item.quantity * item.product?.price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {notes.length > 0 && (
        <>
          <Separator className="my-6" />
          <Card className="shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Tracking Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {notes.map((note: any) => (
                  <li key={note.id} className="text-sm text-gray-700">
                    <span className="font-semibold">
                      {new Date(note.created_at).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      ,{" "}
                      {new Date(note.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                      :
                    </span>{" "}
                    {note.note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
