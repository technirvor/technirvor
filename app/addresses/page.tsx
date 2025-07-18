export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import AddressesContent from "./addresses-content"

export const metadata = {
  title: "My Addresses - Tech Nirvor",
  description: "Manage your saved addresses",
}

export default async function AddressesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <AddressesContent />
}
