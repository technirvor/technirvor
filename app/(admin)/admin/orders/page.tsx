"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Printer,
  Package,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchOrders(1, search, statusFilter);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders(1, search, statusFilter);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page, search, statusFilter);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchOrders = async (page = 1, searchQuery = "", status = "all") => {
    try {
      setLoading(true);

      let query = supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false });

      // Add search filter if provided
      if (searchQuery.trim()) {
        query = query.or(
          `order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`,
        );
      }

      // Add status filter if not "all"
      if (status !== "all") {
        query = query.eq("status", status);
      }

      // Add pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setOrders(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Add tracking note
      await supabase.from("order_tracking").insert({
        order_id: orderId,
        status: newStatus,
        note: `Order status updated to ${newStatus}`,
      });

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus as Order["status"] }
            : order,
        ),
      );
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
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

  // Server-side filtering is now handled in fetchOrders
  const deleteOrder = (orderId: string) => {
    toast.custom(
      (t) => (
        <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-lg border border-red-200 min-w-[320px]">
          <div className="flex-shrink-0 mt-1">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-500" />
            </span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-red-700 mb-1">
              Delete this order?
            </div>
            <div className="text-xs text-gray-500 mb-3">
              This action cannot be undone.
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="destructive"
                className="px-4"
                onClick={async () => {
                  try {
                    // Get the current session token
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();
                    if (!session) {
                      toast.error("Authentication required");
                      return;
                    }

                    const response = await fetch(
                      `/api/admin/orders/${orderId}`,
                      {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${session.access_token}`,
                          "Content-Type": "application/json",
                        },
                      },
                    );

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(
                        errorData.error || "Failed to delete order",
                      );
                    }

                    setOrders(orders.filter((order) => order.id !== orderId));
                    toast.success("Order deleted successfully");
                  } catch (error) {
                    console.error("Error deleting order:", error);
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Failed to delete order",
                    );
                  } finally {
                    toast.dismiss(t);
                  }
                }}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="px-4"
                onClick={() => toast.dismiss(t)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ),
      { duration: 10000 },
    );
  };

  const printInvoice = (orderId: string) => {
    window.open(`/admin/orders/${orderId}/invoice`, "_blank");
  };

  const printLabel = (orderId: string) => {
    window.open(`/admin/orders/${orderId}/label`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto mb-6">
              <div className="h-10 bg-gray-200 rounded w-full md:w-64 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-48 animate-pulse" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {[
                    "Order ID",
                    "Customer",
                    "Phone",
                    "District",
                    "Total",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Orders Management
          </h1>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Name, Phone"
              className="border rounded px-3 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell
                        className="font-mono text-sm cursor-pointer hover:underline"
                        title="Click to copy Order ID"
                        onClick={() => {
                          navigator.clipboard.writeText(order.order_number);
                          toast.success("Order ID copied to clipboard");
                        }}
                      >
                        {order.order_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customer_name}
                      </TableCell>
                      <TableCell>{order.customer_phone}</TableCell>
                      <TableCell>{order.district}</TableCell>
                      <TableCell className="font-semibold">
                        ৳{Number(order.total_amount).toLocaleString("en-US")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => printInvoice(order.id)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => printLabel(order.id)}
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteOrder(order.id)}
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
                  {totalCount} orders
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
