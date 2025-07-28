"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  Gift,
  ArrowLeft,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "sonner";
import { Product } from "@/lib/types";

interface ComboProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  combo_price: number;
  original_price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  items: {
    id: string;
    quantity: number;
    product: Product; // Use the imported Product interface
  }[];
}

export default function ComboProductPage() {
  const params = useParams();
  const [combo, setCombo] = useState<ComboProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (params.slug) {
      fetchCombo(params.slug as string);
    }
  }, [params.slug]);

  const fetchCombo = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from("combo_products")
        .select(
          `
          *,
          items:combo_product_items(
            *,
            product:products(*)
          )
        `,
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setCombo(data);
    } catch (error) {
      console.error("Error fetching combo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!combo) return;
    combo.items.forEach((item) => {
      addItem(item.product, item.quantity);
    });
    toast.success(`Added ${combo.name} to cart!`);
  };

  const handleBuyNow = () => {
    if (!combo) return;
    handleAddToCart();
    window.location.href = "/checkout";
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: combo?.name,
          text: combo?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Combo link copied to clipboard!");
    }
  };

  const calculateSavings = () => {
    if (!combo) return 0;
    return Math.round(
      ((combo.original_price - combo.combo_price) / combo.original_price) * 100,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Combo not found
            </h2>
            <p className="text-gray-600 mb-6">
              The combo offer you're looking for doesn't exist
            </p>
            <Link href="/combo-offers">
              <Button>Browse Combo Offers</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const savings = calculateSavings();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/combo-offers" className="hover:text-gray-900">
              Combo Offers
            </Link>
            <span>/</span>
            <span className="text-gray-900">{combo.name}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Combo Image */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-white">
              <Image
                src={
                  combo.image_url ||
                  combo.items[0]?.product.image_url ||
                  "/placeholder.svg"
                }
                alt={combo.name}
                fill
                className="object-cover"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-green-600 text-white">
                  <Gift className="w-3 h-3 mr-1" />
                  Combo Deal
                </Badge>
                <Badge variant="destructive" className="text-sm font-bold">
                  {savings}% OFF
                </Badge>
              </div>
            </div>
          </div>

          {/* Combo Info */}
          <div className="space-y-6">
            <div>
              <Link href="/combo-offers">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Combo Offers
                </Button>
              </Link>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {combo.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  (4.8) • Combo Deal
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-green-600">
                  ৳{combo.combo_price.toLocaleString()}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ৳{combo.original_price.toLocaleString()}
                </span>
              </div>

              {/* Savings Highlight */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-800">
                    You save with this combo:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    ৳
                    {(
                      combo.original_price - combo.combo_price
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {combo.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  About This Combo
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {combo.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Combo Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What's Included ({combo.items.length} items)
              </h3>
              <div className="space-y-4">
                {combo.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg bg-white"
                  >
                    <Image
                      src={item.product.image_url || "/placeholder.svg"}
                      alt={item.product.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Individual price: ৳
                        {(
                          item.product.sale_price || item.product.price
                        ).toLocaleString()}{" "}
                        each
                      </p>
                    </div>
                    <Link href={`/product/${item.product.slug}`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add Combo to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex space-x-4">
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
                  Share Combo
                </Button>
              </div>
            </div>

            {/* Combo Benefits */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Combo Benefits
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Save ৳
                      {(
                        combo.original_price - combo.combo_price
                      ).toLocaleString()}{" "}
                      compared to buying individually
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Carefully selected products that work great together
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Single purchase, multiple products delivered together
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Quality guaranteed on all combo items
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
