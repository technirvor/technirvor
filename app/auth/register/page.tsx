import RegisterForm from "./register-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Register - Tech Nirvor",
  description: "Create your account",
}

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center bg-muted py-12">
      <RegisterForm />
    </div>
  )
}
