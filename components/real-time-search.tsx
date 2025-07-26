"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    image_url: string;
    category: { name: string };
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export default function RealTimeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    products: [],
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults({ products: [], categories: [] });
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=8`,
        );
        const data = await response.json();
        setResults(data.results || { products: [], categories: [] });
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults({ products: [], categories: [] });
    setShowResults(false);
  };

  const hasResults =
    results.products?.length > 0 || results.categories?.length > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search products, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() =>
            query.length >= 2 && hasResults && setShowResults(true)
          }
          className="pl-10 pr-10 w-full"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && query.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            ) : hasResults ? (
              <div className="py-2">
                {/* Categories */}
                {results.categories.length > 0 && (
                  <div className="px-4 py-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Categories
                    </h4>
                    {results.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        onClick={() => setShowResults(false)}
                        className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        📁 {category.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Products */}
                {results.products.length > 0 && (
                  <div className="px-4 py-2">
                    {results.categories.length > 0 && <hr className="my-2" />}
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Products
                    </h4>
                    {results.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center space-x-3 px-2 py-2 hover:bg-gray-100 rounded"
                      >
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">
                              ৳
                              {(
                                product.sale_price || product.price
                              ).toLocaleString()}
                            </span>
                            {product.sale_price && (
                              <span className="text-xs text-gray-500 line-through">
                                ৳{product.price.toLocaleString()}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {product.category.name}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* View All Results */}
                <div className="px-4 py-2 border-t">
                  <Link
                    href={`/products?search=${encodeURIComponent(query)}`}
                    onClick={() => setShowResults(false)}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all results for "{query}"
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try different keywords
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
