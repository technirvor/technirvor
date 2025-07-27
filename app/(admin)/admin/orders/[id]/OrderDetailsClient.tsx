"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { Order, TrackingNote } from "@/lib/types";

interface OrderDetailsClientProps {
  order: Order;
  trackingNotes: TrackingNote[];
}

export default function OrderDetailsClient({ order, trackingNotes }: OrderDetailsClientProps) {
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
            <span className="font-semibold text-gray-700">Order Number:</span> <span className="font-mono text-gray-900">{order.order_number}</span>
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(order.order_number); toast.success("Order Number copied!"); }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Order ID:</span> <span className="font-mono text-gray-900">{order.id}</span>
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(order.id); toast.success("Order ID copied!"); }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Customer Name:</span> {order.customer_name}
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(order.customer_name); toast.success("Customer Name copied!"); }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {order.customer_email && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Customer Email:</span> {order.customer_email}
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(order.customer_email!); toast.success("Customer Email copied!"); }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Customer Phone:</span> {order.customer_phone}
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(order.customer_phone); toast.success("Customer Phone copied!"); }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <span className="font-semibold">Total Amount:</span> ৳{order.total_amount?.toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Status:</span> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
          <div>
            <span className="font-semibold">Payment Method:</span> {order.payment_method === "COD" ? "Cash On Delivery" : order.payment_method}
          </div>
          <div>
            <span className="font-semibold">Created At:</span> {new Date(order.created_at).toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">District:</span> {order.district}
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center gap-2">
            <span className="font-semibold">Address:</span> {order.address}
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(order.address); toast.success("Address copied!"); }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {order.shipping_address && (
            <div className="col-span-1 md:col-span-2 flex items-center gap-2">
              <span className="font-semibold">Shipping Address:</span> {order.shipping_address}
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(order.shipping_address!); toast.success("Shipping Address copied!"); }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
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
                    <Link href={`/product/${item.product?.slug}`} className="flex items-center gap-2 hover:underline">
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
                  <TableCell className="text-right">৳{item.product?.price?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">৳{(item.quantity * item.product?.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {trackingNotes.length > 0 && (
        <>
          <Separator className="my-6" />
          <Card className="shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Tracking Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {trackingNotes.map((note: any) => (
                  <li key={note.id} className="text-sm text-gray-700">
                    <span className="font-semibold">
                      {new Date(note.created_at).toLocaleString()}:
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
