"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product, Category } from "@/lib/types";

export default function CategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (params.slug) {
      fetchCategoryAndProducts(params.slug as string);
    }
  }, [params.slug, sortBy]);

  const fetchCategoryAndProducts = async (slug: string) => {
    setLoading(true);
    try {
      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Fetch products in this category
      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .eq("category_id", categoryData.id)
        .gt("stock", 0);

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data: productsData, error: productsError } = await query;

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching category and products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Category not found
            </h2>
            <p className="text-gray-600 mb-6">
              The category you're looking for doesn't exist
            </p>
            <Link href="/categories">
              <Button>Browse Categories</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-gray-900">
              Categories
            </Link>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </div>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-lg p-4 sm:p-8 mb-6 sm:mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <Link href="/categories">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Categories
              </Button>
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
              {category.image_url ? (
                <Image
                  src={category.image_url || "/placeholder.svg"}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {category.name.charAt(0)}
                  </span>
                </div>
              )}

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                  {category.name}
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"} available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sort and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Products in {category.name}
          </h2>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              There are no products available in this category at the moment
            </p>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
