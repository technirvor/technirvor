export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import ProfileContent from "./profile-content"

export const metadata = {
  title: "My Profile - Tech Nirvor",
  description: "Manage your profile information",
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <ProfileContent />
}
