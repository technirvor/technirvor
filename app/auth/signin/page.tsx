import SignInForm from "./page.client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export default async function SignInPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/") // Redirect to home if already logged in
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center bg-muted py-12">
      <SignInForm />
    </div>
  )
}
