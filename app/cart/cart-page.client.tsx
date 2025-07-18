"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useCart } from "@/contexts/cart-context"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

/**
 * Full interactive cart UI.
 * This is 100 % identical to the previous `app/cart/page.tsx`
 * (only moved + `"use client"` added).
 */
export default function CartPageClient() {
  const { cartItems, totalItems, totalPrice, removeItemFromCart, clearCart, updateItemQuantity } = useCart()
  const router = useRouter()

  // Ensure the header title updates on mount (nice-to-have)
  useEffect(() => {
    document.title = `Your Cart (${totalItems})`
  }, [totalItems])

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add items to your cart to proceed to checkout.</p>
        <Button className="mt-4" onClick={() => router.push("/products")}>
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-center text-3xl font-bold">Your Cart</h1>

      <Card className="space-y-4">
        <CardHeader>
          <CardTitle>Items ({totalItems})</CardTitle>
          <CardDescription>Review your selections.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex flex-row gap-4 p-4 rounded-lg border bg-muted/40 shadow-sm items-center"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-lg border bg-white flex-shrink-0"
                style={{ minWidth: 80, minHeight: 80 }}
              />
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="truncate">
                    <p className="font-semibold text-base md:text-lg truncate">{item.name}</p>
                    <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 truncate">
                      {/* Replace with item.description if available */}
                      {item.slug ? `Product code: ${item.slug}` : "No description available."}
                    </p>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-muted-foreground text-xs md:text-base">{formatCurrency(item.price)}</p>
                    <p className="font-bold text-base md:text-lg">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Decrease quantity"
                      onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </Button>
                    <span className="text-base font-medium min-w-[2ch] text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Increase quantity"
                      onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => removeItemFromCart(item.productId)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between font-bold">
            <p>Subtotal</p>
            <p>{formatCurrency(totalPrice)}</p>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <Link href="/checkout">
              <Button>Proceed to Checkout</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
