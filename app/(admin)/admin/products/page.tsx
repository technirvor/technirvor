"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Eye,
  AlertTriangle,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts(1, "");
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1, searchQuery);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, searchQuery);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchProducts = async (page = 1, search = "") => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          description,
          price,
          sale_price,
          image_url,
          images,
          category_id,
          subcategory_id,
          is_featured,
          is_flash_sale,
          flash_sale_end,
          stock,
          created_at,
          category:categories(id, name)
        `,
          { count: 'exact' }
        )
        .order("created_at", { ascending: false });

      // Add search filter if provided
      if (search.trim()) {
        query = query.ilike('name', `%${search}%`);
      }

      // Add pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      // Map the data to ensure it matches the Product type
      const mappedProducts = (data || []).map(item => ({
        ...item,
        has_free_delivery: false, // Default value since column doesn't exist yet
        free_delivery_note: undefined, // Default value since column doesn't exist yet
        category: Array.isArray(item.category) ? item.category[0] : item.category
      })) as Product[];
      setProducts(mappedProducts);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to fetch products: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_featured: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, is_featured: !currentStatus } : p,
        ),
      );
      toast.success(
        `Product ${!currentStatus ? "featured" : "unfeatured"} successfully`,
      );
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", id);

      if (error) throw error;

      setProducts(
        products.map((p) => (p.id === id ? { ...p, stock: newStock } : p)),
      );
      toast.success("Stock updated successfully");
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        variant: "destructive" as const,
        text: "Out of Stock",
        color: "text-red-600",
      };
    if (stock <= 10)
      return {
        variant: "secondary" as const,
        text: `Low Stock (${stock})`,
        color: "text-orange-600",
      };
    return {
      variant: "default" as const,
      text: `${stock} units`,
      color: "text-green-600",
    };
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

  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 10 && (p.stock || 0) > 0);
  const outOfStockProducts = products.filter((p) => (p.stock || 0) === 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Products Management
            </h1>
            <div className="flex gap-4 mt-2">
              {lowStockProducts.length > 0 && (
                <Badge variant="secondary" className="text-orange-600">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {lowStockProducts.length} Low Stock
                </Badge>
              )}
              {outOfStockProducts.length > 0 && (
                <Badge variant="destructive">
                  {outOfStockProducts.length} Out of Stock
                </Badge>
              )}
              <Badge variant="outline" className="text-blue-600">
                Total: {totalCount} Products
              </Badge>
            </div>
          </div>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by product name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Products ({products.length} of {totalCount})
              {searchQuery && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  - Filtered by "{searchQuery}"
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                              {searchQuery ? 'No products found matching your search.' : 'No products found.'}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Image
                            src={
                              product.image_url?.trim() ||
                              "/placeholder.svg?height=50&width=50"
                            }
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded-lg object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate">{product.name}</div>
                        </TableCell>
                        <TableCell>
                          {product.category?.name || "No Category"}
                        </TableCell>
                        <TableCell>
                          <div>
                            {product.sale_price && (
                              <span className="text-green-600 font-semibold">
                                ৳{product.sale_price.toLocaleString()}
                              </span>
                            )}
                            <span
                              className={
                                product.sale_price
                                  ? "text-gray-500 line-through ml-2"
                                  : "font-semibold"
                              }
                            >
                              ৳{product.price.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={stockStatus.variant}
                              className={stockStatus.color}
                            >
                              {stockStatus.text}
                            </Badge>
                            {product.stock <= 10 && product.stock > 0 && (
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            )}
                          </div>
                          {/* Debug info */}
                          <div className="text-xs text-gray-500 mt-1">
                            Raw: {product.stock}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {product.is_featured && (
                              <Badge variant="secondary">Featured</Badge>
                            )}
                            {product.is_flash_sale && (
                              <Badge variant="destructive">Flash Sale</Badge>
                            )}
                            {!product.is_featured && !product.is_flash_sale && (
                              <Badge variant="outline">Regular</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/product/${product.slug}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="View Product"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleFeatured(product.id, product.is_featured)
                              }
                              className={
                                product.is_featured
                                  ? "text-yellow-600"
                                  : "text-gray-600"
                              }
                              title="Toggle Featured"
                            >
                              {product.is_featured ? "★" : "☆"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newStock = prompt(
                                  `Update stock for ${product.name}:`,
                                  product.stock.toString(),
                                );
                                if (
                                  newStock !== null &&
                                  !isNaN(Number(newStock))
                                ) {
                                  updateStock(product.id, Number(newStock));
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Update Stock"
                            >
                              <Package className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                              className="text-red-600 hover:text-red-800"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} products
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
                          variant={currentPage === pageNum ? "default" : "outline"}
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
          </>
        )}
      </CardContent>
    </Card>
  </div>
</div>
);
}
