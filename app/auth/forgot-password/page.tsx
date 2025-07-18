import ForgotPasswordForm from "./forgot-password-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Forgot Password - Tech Nirvor",
  description: "Reset your password",
}

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center bg-muted py-12">
      <ForgotPasswordForm />
    </div>
  )
}
