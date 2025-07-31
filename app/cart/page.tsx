"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } =
    useCartStore();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    setIsClearing(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading
    clearCart();
    setIsClearing(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="text-center py-12 sm:py-16">
            <ShoppingBag className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Add some products to get started
            </p>
            <Link href="/products">
              <Button size="lg" className="w-full max-w-xs mx-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <Button
            variant="outline"
            onClick={handleClearCart}
            disabled={isClearing}
            className="w-full sm:w-auto"
          >
            {isClearing ? "Clearing..." : "Clear Cart"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <Image
                    src={item.product.image_url || "/placeholder.svg"}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover mx-auto sm:mx-0"
                  />

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {item.product.name}
                      {item.isCombo && (
                        <Badge className="ml-2 bg-green-600 text-white text-xs">
                          Combo
                        </Badge>
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      ৳
                      {item.isCombo && item.comboPrice
                        ? item.comboPrice.toLocaleString()
                        : (
                            item.product.sale_price || item.product.price
                          ).toLocaleString()}
                    </p>
                    {item.isCombo && item.comboItems && (
                      <div className="text-xs text-gray-500 mt-1">
                        Includes: {item.comboItems.map(ci => ci.product.name).join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="px-2"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 sm:w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="px-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2 min-w-[90px]">
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      ৳
                      {item.isCombo && item.comboPrice
                        ? (item.comboPrice * item.quantity).toLocaleString()
                        : (
                            (item.product.sale_price || item.product.price) *
                            item.quantity
                          ).toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ৳{getTotalPrice().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">৳60</span>
                </div>
                <div className="border-t pt-2 sm:pt-3">
                  <div className="flex justify-between text-base sm:text-lg font-semibold">
                    <span>Total</span>
                    <span>৳{(getTotalPrice() + 60).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mt-2 sm:mt-3 bg-transparent"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
