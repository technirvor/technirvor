"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  Home,
  Package,
  LayoutDashboard,
  LogOut,
  LogIn,
  MapPin,
  Clock,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut, signIn } from "next-auth/react"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

type Session = {
  user?: SessionUser
}

export default function Navbar() {
  const { data: session } = useSession() as { data: Session | null }
  const { cartItems } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-4 py-6">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <Image
                    src="/logo/logo-dark.png"
                    alt="Tech Nirvor"
                    width={240}
                    height={40}
                    className="block dark:hidden"
                    priority
                  />
                  <Image
                    src="/logo/logo-white.png"
                    alt="Tech Nirvor"
                    width={240}
                    height={40}
                    className="hidden dark:block"
                    priority
                  />
                </Link>
                <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:underline">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link href="/products" className="flex items-center gap-2 text-sm font-medium hover:underline">
                  <Package className="h-4 w-4" />
                  All Products
                </Link>
                <Link href="/categories" className="flex items-center gap-2 text-sm font-medium hover:underline">
                  <LayoutDashboard className="h-4 w-4" />
                  Categories
                </Link>
                {session?.user?.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-2 text-sm font-medium hover:underline">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                {session ? (
                  <>
                    <Link href="/my-orders" className="flex items-center gap-2 text-sm font-medium hover:underline">
                      <Clock className="h-4 w-4" />
                      My Orders
                    </Link>
                    <Link href="/addresses" className="flex items-center gap-2 text-sm font-medium hover:underline">
                      <MapPin className="h-4 w-4" />
                      My Addresses
                    </Link>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-sm font-medium"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  // <Button
                  //   variant="ghost"
                  //   className="flex items-center gap-2 text-sm font-medium"
                  //   onClick={() => signIn()}
                  // >
                  //   <LogIn className="h-4 w-4" />
                  //   Sign In
                  // </Button>
                  <></>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="hidden items-center gap-2 text-lg font-semibold lg:flex">
            <Image
              src="/logo/logo-dark.png"
              alt="Tech Nirvor"
              width={240}
              height={40}
              className="block dark:hidden"
              priority
            />
            <Image
              src="/logo/logo-white.png"
              alt="Tech Nirvor"
              width={240}
              height={40}
              className="hidden dark:block"
              priority
            />
          </Link>
          <nav className="hidden gap-6 lg:flex">
            <Link href="/" className="text-sm font-medium hover:underline">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium hover:underline">
              All Products
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:underline">
              Categories
            </Link>
            {session?.user?.role === "admin" && (
              <Link href="/admin" className="text-sm font-medium hover:underline">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-64 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartItems.length}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Button>
          </Link>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || "/placeholder-user.jpg"} />
                    <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/profile" className="flex items-center gap-2 w-full">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/my-orders" className="flex items-center gap-2 w-full">
                    <Clock className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/addresses" className="flex items-center gap-2 w-full">
                    <MapPin className="h-4 w-4" />
                    My Addresses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // <Button variant="ghost" onClick={() => signIn()}>
            //   Sign In
            // </Button>
            <>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
