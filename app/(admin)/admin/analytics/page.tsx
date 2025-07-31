"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    topProducts: [],
    dailyStats: [],
    ordersByStatus: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // Last 30 days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = subDays(endDate, dateRange);
      const previousStartDate = subDays(startDate, dateRange);

      // Fetch orders data
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Fetch previous period orders for comparison
      const { data: previousOrders } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", previousStartDate.toISOString())
        .lt("created_at", startDate.toISOString());

      // Fetch products count
      const { data: products } = await supabase
        .from("products")
        .select("id");

      // Fetch order items with product details
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products(id, name),
          order:orders!inner(created_at)
        `)
        .gte("order.created_at", startDate.toISOString())
        .lte("order.created_at", endDate.toISOString());

      if (orders && previousOrders && products && orderItems) {
        // Calculate basic metrics
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const totalOrders = orders.length;
        const totalProducts = products.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate growth rates
        const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const previousOrderCount = previousOrders.length;
        const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const orderGrowth = previousOrderCount > 0 ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 : 0;

        // Calculate top products
        const productSales = orderItems.reduce((acc, item) => {
          const productId = item.product?.id;
          const productName = item.product?.name || 'Unknown Product';
          if (productId) {
            if (!acc[productId]) {
              acc[productId] = {
                id: productId,
                name: productName,
                sales: 0,
                revenue: 0,
              };
            }
            acc[productId].sales += item.quantity || 0;
            acc[productId].revenue += (item.price || 0) * (item.quantity || 0);
          }
          return acc;
        }, {} as Record<string, any>);

        const topProducts = Object.values(productSales)
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 5) as Array<{
            id: string;
            name: string;
            sales: number;
            revenue: number;
          }>;

        // Calculate daily stats
        const dailyStats = [];
        for (let i = dateRange - 1; i >= 0; i--) {
          const date = subDays(endDate, i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);
          
          const dayOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= dayStart && orderDate <= dayEnd;
          });
          
          const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
          
          dailyStats.push({
            date: format(date, 'MMM dd'),
            orders: dayOrders.length,
            revenue: dayRevenue,
          });
        }

        // Calculate orders by status
        const statusCounts = orders.reduce((acc, order) => {
          const status = order.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count: count as number,
        }));

        setAnalytics({
          totalRevenue,
          totalOrders,
          totalProducts,
          averageOrderValue,
          revenueGrowth,
          orderGrowth,
          topProducts,
          dailyStats,
          ordersByStatus,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Sales insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange(7)}
            className={`px-3 py-1 rounded text-sm ${
              dateRange === 7 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange(30)}
            className={`px-3 py-1 rounded text-sm ${
              dateRange === 30 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange(90)}
            className={`px-3 py-1 rounded text-sm ${
              dateRange === 90 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{analytics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              {analytics.revenueGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {analytics.revenueGrowth.toFixed(1)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalOrders.toLocaleString()}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              {analytics.orderGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={analytics.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {analytics.orderGrowth.toFixed(1)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{analytics.averageOrderValue.toFixed(0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalProducts.toLocaleString()}
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">৳{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.ordersByStatus.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(status.status)}>
                      {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                    </Badge>
                  </div>
                  <span className="font-semibold">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-xs text-gray-600">
              {analytics.dailyStats.slice(-7).map((day) => (
                <div key={day.date} className="text-center">
                  <div className="font-medium">{day.date}</div>
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <div className="text-blue-600 font-semibold">{day.orders}</div>
                    <div className="text-xs">orders</div>
                  </div>
                  <div className="mt-1 p-2 bg-green-50 rounded">
                    <div className="text-green-600 font-semibold">৳{day.revenue.toLocaleString()}</div>
                    <div className="text-xs">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}