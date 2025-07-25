"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";

interface CategoryWithCount extends Category {
  product_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // First get categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      // Then get product counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id)
            .gt("stock", 0);

          return {
            ...category,
            product_count: count || 0,
          };
        }),
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h1>
          <p className="text-gray-600">
            Browse our wide range of product categories
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        {category.image_url ? (
                          <Image
                            src={category.image_url || "/placeholder.svg"}
                            alt={category.name}
                            fill
                            className="rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-bold text-2xl">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>

                      <Badge variant="secondary" className="text-xs">
                        {category.product_count}{" "}
                        {category.product_count === 1 ? "product" : "products"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No categories found
            </h2>
            <p className="text-gray-600">
              Categories will appear here once they are added
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
