"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({
  product,
  className = "",
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Ensure stock is always a number
  const stockQuantity =
    typeof product.stock === "number" && !isNaN(product.stock)
      ? product.stock
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stockQuantity <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    addItem(product);
    toast.success("Added to cart!");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stockQuantity <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    addItem(product);
    window.location.href = "/checkout";
  };

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 ${className}`}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative group">
          <Image
            src={
              product.image_url
                ? product.image_url.trimStart()
                : "/placeholder.svg?height=240&width=300"
            }
            alt={product.name}
            width={300}
            height={240}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_flash_sale && (
              <Badge variant="destructive" className="text-xs font-medium">
                <Clock className="w-3 h-3 mr-1" />
                Flash Sale
              </Badge>
            )}
            {hasDiscount && (
              <Badge
                variant="secondary"
                className="text-xs font-medium bg-green-100 text-green-800"
              >
                -{discountPercentage}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="text-xs font-medium bg-blue-100 text-blue-800">
                Featured
              </Badge>
            )}
            {stockQuantity <= 10 && stockQuantity > 0 && (
              <Badge
                variant="outline"
                className="text-xs font-medium bg-orange-100 text-orange-800 border-orange-200"
              >
                Low Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.success("Added to wishlist!");
            }}
          >
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </Button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-5">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              ৳{currentPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status - Debug info included */}
          <div className="mb-3">
            {stockQuantity > 0 ? (
              <span className="text-xs text-green-600 font-medium">
                {stockQuantity} in stock
              </span>
            ) : (
              <span className="text-xs text-red-600 font-medium">
                Out of stock (Stock: {stockQuantity})
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {stockQuantity > 0 ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 px-2 bg-transparent"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs font-medium"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="w-full h-8 text-xs"
              disabled
            >
              Out of Stock
            </Button>
          )}
        </div>
      </Link>
    </div>
  );
}
