"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { IUser } from "@/lib/models/user"

export default function EditUserPage({ params }: { params: { id: string } }) {
  const userId = params.id
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("") // Optional: for changing password
  const [role, setRole] = useState("user")
  const [loading, setLoading] = useState(true) // Initial loading for fetching user
  const [submitting, setSubmitting] = useState(false) // For form submission
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/users/${userId}`)
        if (res.ok) {
          const userData: IUser = await res.json()
          setName(userData.name || "")
          setEmail(userData.email || "")
          setPhone(userData.phone || "")
          setRole(userData.role || "user")
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch user data.",
            variant: "destructive",
          })
          router.push("/admin/users") // Redirect if user not found
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Network error or server issue while fetching user data.",
          variant: "destructive",
        })
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [userId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)


    if (!name || !email || !role || !phone) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password: password || undefined, role }),
      })

      if (res.ok) {
        toast({
          title: "User Updated",
          description: "User details have been updated successfully.",
          variant: "default",
        })
        router.push("/admin/users")
      } else {
        const errorData = await res.json()
        toast({
          title: "Update Failed",
          description: errorData.message || "Failed to update user.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Network error or server issue.",
        variant: "destructive",
      })
      console.error("Error updating user:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading user data...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
          <CardDescription>Update the details for this user.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={submitting}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password (Optional)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} disabled={submitting}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating User...
                </>
              ) : (
                "Update User"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
