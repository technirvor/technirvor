export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import OrderHistoryContent from "./order-history-content"

export const metadata = {
  title: "My Orders - Tech Nirvor",
  description: "View your order history",
}

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <OrderHistoryContent />
    </div>
  )
}
