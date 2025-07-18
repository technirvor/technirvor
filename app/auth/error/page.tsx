"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An unexpected error occurred."
  switch (error) {
    case "OAuthAccountNotLinked":
      errorMessage = "This email is already registered with a different provider. Please sign in with that provider."
      break
    case "CredentialsSignin":
      errorMessage = "Invalid email or password. Please try again."
      break
    case "AccessDenied":
      errorMessage = "Access Denied. You do not have permission to view this page."
      break
    case "Verification":
      errorMessage = "The sign in link is no longer valid. It may have been used already or it has expired."
      break
    default:
      errorMessage = "An error occurred during authentication. Please try again."
      break
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center space-y-6 text-center bg-muted py-12">
      <AlertCircle className="h-16 w-16 text-destructive" />
      <h1 className="text-3xl font-bold text-destructive">Authentication Error</h1>
      <p className="max-w-md text-muted-foreground">{errorMessage}</p>
      <div className="flex gap-4">
        <Link href="/auth/signin">
          <Button>Go to Sign In</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Go to Home</Button>
        </Link>
      </div>
    </div>
  )
}
