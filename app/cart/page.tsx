/**
 * Server entry for /cart
 * Splits interactive cart UI into a dedicated Client Component.
 */
export const dynamic = "force-dynamic"

import CartPageClient from "./cart-page.client"

export default function CartPage() {
  return <CartPageClient />
}
