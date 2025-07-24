'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Printer, Package, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `,
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Add tracking note
      await supabase.from('order_tracking').insert({
        order_id: orderId,
        status: newStatus,
        note: `Order status updated to ${newStatus}`,
      });

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order,
        ),
      );
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchLower) ||
      order.customer_name?.toLowerCase().includes(searchLower) ||
      order.customer_phone?.toLowerCase().includes(searchLower);
    return matchesStatus && (!search || matchesSearch);
  });
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
            <div className="font-semibold text-red-700 mb-1">Delete this order?</div>
            <div className="text-xs text-gray-500 mb-3">This action cannot be undone.</div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="destructive"
                className="px-4"
                onClick={async () => {
                  try {
                    const { error } = await supabase.from('orders').delete().eq('id', orderId);
                    if (error) throw error;
                    setOrders(orders.filter((order) => order.id !== orderId));
                    toast.success('Order deleted successfully');
                  } catch (error) {
                    console.error('Error deleting order:', error);
                    toast.error('Failed to delete order');
                  } finally {
                    toast.dismiss(t);
                  }
                }}
              >
                Delete
              </Button>
              <Button size="sm" variant="outline" className="px-4" onClick={() => toast.dismiss(t)}>
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
    window.open(`/admin/orders/${orderId}/invoice`, '_blank');
  };

  const printLabel = (orderId: string) => {
    window.open(`/admin/orders/${orderId}/label`, '_blank');
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
                    'Order ID',
                    'Customer',
                    'Phone',
                    'District',
                    'Total',
                    'Status',
                    'Date',
                    'Actions',
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
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
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
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
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
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell
                        className="font-mono text-sm cursor-pointer hover:underline"
                        title={order.order_number}
                        onClick={() => {
                          navigator.clipboard.writeText(order.order_number);
                          toast.success('Order ID copied to clipboard');
                        }}
                      >
                        {order.order_number.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">{order.customer_name}</TableCell>
                      <TableCell>{order.customer_phone}</TableCell>
                      <TableCell>{order.district}</TableCell>
                      <TableCell className="font-semibold">
                        ৳{Number(order.total_amount).toLocaleString('en-US')}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{format(new Date(order.created_at), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => printInvoice(order.id)}>
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => printLabel(order.id)}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
