"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  product: Product;
}

export default function ProductPageClient({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    window.location.href = "/checkout";
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };
    if (
      navigator.share &&
      (typeof navigator.canShare !== "function" ||
        navigator.canShare(shareData))
    ) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // If user cancels or share fails, fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success("Product link copied to clipboard!");
        } catch {
          toast.error("Unable to share or copy link.");
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied to clipboard!");
      } catch {
        toast.error("Unable to copy link to clipboard.");
      }
    } else {
      // Fallback for very old browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Product link copied to clipboard!");
      } catch {
        toast.error("Unable to share or copy link.");
      }
      document.body.removeChild(textArea);
    }
  };

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image_url];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-8">
          <div className="flex flex-wrap items-center space-x-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-900">
              Products
            </Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  href={`/category/${product.category.slug}`}
                  className="hover:text-gray-900"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-white w-full max-w-md mx-auto lg:mx-0">
              <Image
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_flash_sale && (
                  <Badge variant="destructive">
                    <Clock className="w-3 h-3 mr-1" />
                    Flash Sale
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="secondary">-{discountPercentage}% OFF</Badge>
                )}
                {product.is_featured && <Badge>Featured</Badge>}
              </div>
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-2 px-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 snap-center focus:outline-none ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-2 sm:mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">
                  (4.5) • 123 reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg sm:text-xl text-gray-500 line-through">
                    ৳{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4 sm:mb-6">
                {product.stock > 0 ? (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Quantity and Actions */}
            {product.stock > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 sm:w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
                  <Button onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Heart className="w-4 h-4 mr-2" />
                Add to Wishlist
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-transparent"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Product Details */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                  Product Details
                </h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">
                      {product.category?.name || "Uncategorized"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium font-mono">
                      {product.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className="font-medium">
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
