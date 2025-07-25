"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

export default function NewFlashSalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [flashSaleData, setFlashSaleData] = useState({
    endDate: "",
    endTime: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .eq("is_flash_sale", false)
        .gt("stock", 0)
        .not("sale_price", "is", null)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    if (!flashSaleData.endDate) {
      toast.error("Please select an end date");
      return;
    }

    setLoading(true);

    try {
      const endDateTime = flashSaleData.endTime
        ? `${flashSaleData.endDate}T${flashSaleData.endTime}`
        : `${flashSaleData.endDate}T23:59:59`;

      // Update selected products to be flash sale items
      const { error } = await supabase
        .from("products")
        .update({
          is_flash_sale: true,
          flash_sale_end: endDateTime,
        })
        .in("id", selectedProducts);

      if (error) throw error;

      toast.success(`${selectedProducts.length} products added to flash sale!`);
      router.push("/admin/flash-sale");
    } catch (error) {
      console.error("Error creating flash sale:", error);
      toast.error("Failed to create flash sale");
    } finally {
      setLoading(false);
    }
  };

  const selectedProductsData = products.filter((p) =>
    selectedProducts.includes(p.id),
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Create Flash Sale
            </h1>
          </div>
          <p className="text-gray-600">
            Add products to flash sale with time-limited offers
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Flash Sale Settings */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Flash Sale Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={flashSaleData.endDate}
                      onChange={(e) =>
                        setFlashSaleData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time (Optional)</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={flashSaleData.endTime}
                      onChange={(e) =>
                        setFlashSaleData((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Leave empty for end of day
                    </p>
                  </div>

                  {/* Selected Products Summary */}
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">
                      Selected Products
                    </h4>
                    <p className="text-red-700 text-sm">
                      {selectedProducts.length} product
                      {selectedProducts.length !== 1 ? "s" : ""} selected
                    </p>
                    {selectedProductsData.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {selectedProductsData.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="text-sm text-red-800"
                          >
                            • {product.name}
                          </div>
                        ))}
                        {selectedProductsData.length > 3 && (
                          <div className="text-sm text-red-600">
                            +{selectedProductsData.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {loading ? "Creating..." : "Create Flash Sale"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Product Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Products for Flash Sale</CardTitle>
                <p className="text-sm text-gray-600">
                  Only products with sale prices are eligible for flash sales
                </p>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {products.map((product) => {
                      const isSelected = selectedProducts.includes(product.id);
                      const discount = product.sale_price
                        ? calculateDiscount(product.price, product.sale_price)
                        : 0;

                      return (
                        <div
                          key={product.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleProductToggle(product.id)}
                        >
                          <div className="flex items-center space-x-4">
                            <Image
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {product.category?.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm line-through text-gray-500">
                                  ৳{product.price.toLocaleString()}
                                </span>
                                <span className="font-semibold text-red-600">
                                  ৳
                                  {(
                                    product.sale_price || product.price
                                  ).toLocaleString()}
                                </span>
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {discount}% OFF
                                </Badge>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <div
                                className={`w-5 h-5 rounded border-2 ${
                                  isSelected
                                    ? "bg-red-500 border-red-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 text-white m-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Eligible Products
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Products need to have sale prices to be eligible for flash
                      sales
                    </p>
                    <Button onClick={() => router.push("/admin/products")}>
                      Manage Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
