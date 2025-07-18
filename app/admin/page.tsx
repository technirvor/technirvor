export const dynamic = "force-dynamic" // Force dynamic rendering for this page
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, Users, ListOrdered } from "lucide-react"
import { connectToDB } from "@/lib/db"
import OrderModel from "@/lib/models/order"
import ProductModel from "@/lib/models/product"
import UserModel from "@/lib/models/user"
import { formatCurrency } from "@/lib/utils"

export default async function AdminDashboardPage() {
  await connectToDB()

  // Fetch dashboard stats
  const totalOrders = await OrderModel.countDocuments({})
  const totalProducts = await ProductModel.countDocuments({})
  const totalUsers = await UserModel.countDocuments({})

  const totalRevenueResult = await OrderModel.aggregate([
    { $match: { status: "delivered" } }, // Only count delivered orders for revenue
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ])
  const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0

  const latestOrders = await OrderModel.find({}).sort({ createdAt: -1 }).limit(5).populate("user", "name email").lean()

  const latestProducts = await ProductModel.find({}).sort({ createdAt: -1 }).limit(5).lean()

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestOrders.length === 0 ? (
                <p className="text-muted-foreground">No recent orders.</p>
              ) : (
                latestOrders.map((order) => (
                  <div key={order._id.toString()} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{(order.user as any)?.name || order.shippingAddress.fullName}</p>
                      <p className="text-sm text-muted-foreground">Order ID: {order._id.toString().slice(0, 8)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totalPrice)}</p>
                      <p className="text-sm capitalize text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Added Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestProducts.length === 0 ? (
                <p className="text-muted-foreground">No recent products.</p>
              ) : (
                latestProducts.map((product) => (
                  <div key={product._id.toString()} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Category: {product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.price)}</p>
                      <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
