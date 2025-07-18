import ResetPasswordForm from "./reset-password-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Reset Password - Tech Nirvor",
  description: "Set your new password",
}

interface ResetPasswordPageProps {
  searchParams: { token?: string }
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  if (!searchParams.token) {
    redirect("/auth/forgot-password")
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center bg-muted py-12">
      <ResetPasswordForm token={searchParams.token} />
    </div>
  )
}
