"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Eye, EyeOff, Github } from "lucide-react"

export default function SignInForm() {
  const [formData, setFormData] = useState({
    identifier: "", // Can be email or phone
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [identifierWarning, setIdentifierWarning] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  // Bangladeshi phone number validation (starts with 01, 11 digits)
  const isValidBDPhone = (phone: string) => {
    return /^01[3-9]\d{8}$/.test(phone);
  }

  const isEmail = (value: string) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (name === "identifier") {
      if (value.length > 0 && !isEmail(value) && !isValidBDPhone(value)) {
        setIdentifierWarning("Enter a valid email or Bangladeshi phone number (e.g., 01XXXXXXXXX)");
      } else {
        setIdentifierWarning("");
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // If identifier is not email, validate as Bangladeshi phone
    if (formData.identifier.length > 0 && !isEmail(formData.identifier) && !isValidBDPhone(formData.identifier)) {
      setIdentifierWarning("Enter a valid email or Bangladeshi phone number (e.g., 01XXXXXXXXX)");
      toast({
        title: "Error",
        description: "Please enter a valid email or Bangladeshi phone number.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        identifier: formData.identifier,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        })
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubSignIn = () => {
    signIn("github", { callbackUrl })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Phone Number</Label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter email or phone number"
              required
              disabled={loading}
              className={identifierWarning ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {identifierWarning && (
              <p className="text-xs text-red-500 mt-1">{identifierWarning}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4 bg-transparent"
            onClick={handleGitHubSignIn}
            disabled={loading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        <div className="mt-4 text-center text-sm space-y-2">
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            Forgot your password?
          </Link>
          <div>
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
