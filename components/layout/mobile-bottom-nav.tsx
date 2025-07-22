"use client"

import Link from "next/link"
import { Home, Package, ShoppingCart, ChartBarStacked } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useSession } from "next-auth/react"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { cartItems } = useCart()

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: ChartBarStacked,
    },
    {
      name: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      badge: cartItems.length,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background shadow-lg md:hidden">
      <nav className="grid h-16 grid-cols-4 items-center justify-items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href === "/products" && pathname.startsWith("/products"))

          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center gap-1">
              <Button variant="ghost" size="icon" className="relative">
                <Icon className={isActive ? "h-6 w-6 text-primary" : "h-6 w-6 text-muted-foreground"} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                )}
                <span className="sr-only">{item.name}</span>
              </Button>
              <span className={isActive ? "text-xs text-primary" : "text-xs text-muted-foreground"}>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
