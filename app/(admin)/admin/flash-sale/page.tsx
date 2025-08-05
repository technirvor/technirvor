"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { Edit, Trash2, Plus, Eye, Clock, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

export default function AdminFlashSalePage() {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashSaleProducts();
  }, []);

  const fetchFlashSaleProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .eq("is_flash_sale", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFlashSaleProducts(data || []);
    } catch (error) {
      console.error("Error fetching flash sale products:", error);
      toast.error("Failed to fetch flash sale products");
    } finally {
      setLoading(false);
    }
  };

  const removeFromFlashSale = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from flash sale?`)) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({
          is_flash_sale: false,
          flash_sale_end: null,
        })
        .eq("id", id);

      if (error) throw error;

      setFlashSaleProducts(flashSaleProducts.filter((p) => p.id !== id));
      toast.success("Product removed from flash sale");
    } catch (error) {
      console.error("Error removing from flash sale:", error);
      toast.error("Failed to remove from flash sale");
    }
  };

  const isFlashSaleActive = (endDate: string | null | undefined) => {
    if (!endDate) return true;
    return new Date(endDate) > new Date();
  };

  const getTimeRemaining = (endDate: string | null | undefined) => {
    if (!endDate) return "No end date";

    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const distance = end - now;

    if (distance < 0) return "Expired";

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Flash Sale Management
            </h1>
          </div>
          <Link href="/admin/flash-sale/new">
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add to Flash Sale
            </Button>
          </Link>
        </div>

        {/* Flash Sale Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Flash Sale Products
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {flashSaleProducts.length}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Sales
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      flashSaleProducts.filter((p) =>
                        isFlashSaleActive(p.flash_sale_end),
                      ).length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Expired Sales
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {
                      flashSaleProducts.filter(
                        (p) => !isFlashSaleActive(p.flash_sale_end),
                      ).length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Flash Sale Products ({flashSaleProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Original Price</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Time Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flashSaleProducts.map((product) => {
                    const discount = product.sale_price
                      ? Math.round(
                          ((product.price - product.sale_price) /
                            product.price) *
                            100,
                        )
                      : 0;
                    const isActive = isFlashSaleActive(product.flash_sale_end);

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Image
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded-lg object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          {product.category?.name || "No Category"}
                        </TableCell>
                        <TableCell className="line-through text-gray-500">
                          ৳{product.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-semibold text-red-600">
                          ৳
                          {(
                            product.sale_price || product.price
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{discount}% OFF</Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              isActive ? "text-green-600" : "text-red-600"
                            }
                          >
                            {getTimeRemaining(product.flash_sale_end)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? "Active" : "Expired"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/product/${product.slug}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeFromFlashSale(product.id, product.name)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {flashSaleProducts.length === 0 && (
              <div className="text-center py-8">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Flash Sale Products
                </h3>
                <p className="text-gray-600 mb-4">
                  Add products to flash sale to boost sales
                </p>
                <Link href="/admin/flash-sale/new">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Add First Flash Sale Product
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
