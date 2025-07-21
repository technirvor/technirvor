/**
 * Server entry for /cart
 * Splits interactive cart UI into a dedicated Client Component.
 */
export const dynamic = "force-dynamic"

import CartPageClient from "./cart-page.client"

export default function CartPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <CartPageClient />
    </div>
  )
}
