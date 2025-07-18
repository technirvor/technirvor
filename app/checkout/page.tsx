/**
 * Server entry for /checkout
 * – Forces dynamic rendering (cart state only exists in the browser)
 * – Simply renders the existing client component.
 */
export const dynamic = "force-dynamic"

import CheckoutContent from "./checkout-content" // <-- this file already has `"use client"`

export default function CheckoutPage() {
  return <CheckoutContent />
}
