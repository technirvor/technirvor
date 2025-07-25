import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ImageIcon,
  Zap,
  Gift,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-10 tracking-tight drop-shadow">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Products",
              icon: <Package className="w-8 h-8 text-blue-600" />,
              desc: "Manage your product catalog",
              links: [
                {
                  href: "/admin/products",
                  label: "View All Products",
                  variant: "default",
                },
                {
                  href: "/admin/products/new",
                  label: "Add New Product",
                  variant: "outline",
                },
              ],
            },
            {
              title: "Categories",
              icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
              desc: "Organize your products",
              links: [
                {
                  href: "/admin/categories",
                  label: "View Categories",
                  variant: "default",
                },
                {
                  href: "/admin/categories/new",
                  label: "Add Category",
                  variant: "outline",
                },
              ],
            },
            {
              title: "Orders",
              icon: <ShoppingCart className="w-8 h-8 text-orange-500" />,
              desc: "Manage customer orders",
              links: [
                {
                  href: "/admin/orders",
                  label: "View All Orders",
                  variant: "default",
                },
                {
                  href: "/admin/orders/pending",
                  label: "Pending Orders",
                  variant: "outline",
                },
              ],
            },
            {
              title: "Flash Sale",
              icon: <Zap className="w-8 h-8 text-red-500" />,
              desc: "Manage flash sale products",
              links: [
                {
                  href: "/admin/flash-sale",
                  label: "View Flash Sales",
                  variant: "default",
                  className: "bg-red-600 hover:bg-red-700",
                },
                {
                  href: "/admin/flash-sale/new",
                  label: "Create Flash Sale",
                  variant: "outline",
                },
              ],
            },
            {
              title: "Combo Products",
              icon: <Gift className="w-8 h-8 text-green-500" />,
              desc: "Create product bundles",
              links: [
                {
                  href: "/admin/combo-products",
                  label: "View Combos",
                  variant: "default",
                  className: "bg-green-600 hover:bg-green-700",
                },
                {
                  href: "/admin/combo-products/new",
                  label: "Create Combo",
                  variant: "outline",
                },
              ],
            },
            {
              title: "Hero Slider",
              icon: <ImageIcon className="w-8 h-8 text-pink-500" />,
              desc: "Manage homepage slides",
              links: [
                {
                  href: "/admin/hero-slides",
                  label: "View Slides",
                  variant: "default",
                },
                {
                  href: "/admin/hero-slides/new",
                  label: "Add New Slide",
                  variant: "outline",
                },
              ],
            },
            {
              title: "Districts",
              icon: <Settings className="w-8 h-8 text-gray-700" />,
              desc: "Manage delivery areas",
              links: [
                {
                  href: "/admin/districts",
                  label: "View Districts",
                  variant: "default",
                },
                {
                  href: "/admin/districts/new",
                  label: "Add District",
                  variant: "outline",
                },
              ],
            },
            {
              title: "Analytics",
              icon: <Users className="w-8 h-8 text-blue-700" />,
              desc: "View sales analytics",
              links: [
                {
                  href: "/admin/analytics",
                  label: "View Analytics",
                  variant: "default",
                },
              ],
            },
          ].map((card, idx) => (
            <Card
              key={card.title}
              className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-200 bg-white border border-gray-100 group"
            >
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  {card.icon}
                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-4 text-sm">{card.desc}</p>
                <div className="flex flex-wrap gap-3">
                  {card.links.map((link, lidx) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex-1 min-w-[140px]"
                    >
                      <Button
                        className={`w-full ${link.className || ""}`}
                        variant={link.variant as any}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
