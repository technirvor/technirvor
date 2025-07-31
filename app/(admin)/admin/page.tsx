"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ImageIcon,
  Zap,
  Gift,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  todayOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    todayOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch orders stats
      const { data: orders } = await supabase
        .from("orders")
        .select("status, total_amount, created_at");

      // Fetch products stats
      const { data: products } = await supabase
        .from("products")
        .select("stock_quantity");

      if (orders && products) {
        const today = new Date().toISOString().split("T")[0];
        const todayOrders = orders.filter((order) =>
          order.created_at.startsWith(today)
        ).length;

        const pendingOrders = orders.filter(
          (order) => order.status === "pending"
        ).length;

        const totalRevenue = orders.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        );

        const lowStockProducts = products.filter(
          (product) => (product.stock_quantity || 0) < 10
        ).length;

        setStats({
          totalOrders: orders.length,
          pendingOrders,
          totalProducts: products.length,
          lowStockProducts,
          totalRevenue,
          todayOrders,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-blue-100">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalOrders}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.pendingOrders}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            {stats.pendingOrders > 0 && (
              <Badge variant="destructive" className="mt-2">
                Needs Attention
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{loading ? "..." : stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalProducts}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
            {stats.lowStockProducts > 0 && (
              <div className="mt-2 flex items-center text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>{stats.lowStockProducts} low stock</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products/new">
              <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                <Plus className="h-6 w-6" />
                <span className="text-sm">Add Product</span>
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                <Eye className="h-6 w-6" />
                <span className="text-sm">View Orders</span>
              </Button>
            </Link>
            <Link href="/admin/combo-products/new">
              <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                <Gift className="h-6 w-6" />
                <span className="text-sm">Create Combo</span>
              </Button>
            </Link>
            <Link href="/admin/flash-sale/new">
              <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                <Zap className="h-6 w-6" />
                <span className="text-sm">Flash Sale</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Product Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/products">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Categories
                </Button>
              </Link>
              <Link href="/admin/combo-products">
                <Button variant="outline" className="w-full justify-start">
                  <Gift className="h-4 w-4 mr-2" />
                  Combos
                </Button>
              </Link>
              <Link href="/admin/flash-sale">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Flash Sale
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Order Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              Order Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    All Orders
                  </span>
                  <Badge variant="secondary">{stats.totalOrders}</Badge>
                </Button>
              </Link>
              {stats.pendingOrders > 0 && (
                <Link href="/admin/orders?status=pending">
                  <Button variant="outline" className="w-full justify-between border-orange-200">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      Pending Orders
                    </span>
                    <Badge variant="destructive">{stats.pendingOrders}</Badge>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/hero-slides">
                <Button variant="outline" className="w-full justify-start">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Hero Slides
                </Button>
              </Link>
              <Link href="/admin/districts">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Districts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Analytics & Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Sales Analytics
              </Button>
            </Link>
            <div className="text-sm text-gray-600">
              <p>Today's Orders: <span className="font-semibold">{stats.todayOrders}</span></p>
              <p>Revenue: <span className="font-semibold">৳{stats.totalRevenue.toLocaleString()}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security & System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Database</p>
                <p className="text-sm text-green-700">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Security</p>
                <p className="text-sm text-green-700">All systems secure</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Admin Access</p>
                <p className="text-sm text-blue-700">Active session</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
