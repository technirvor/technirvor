"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"
import type { IProduct as IProductBase } from "@/lib/models/product"

interface IProduct extends Omit<IProductBase, "originalPrice"> {
  originalPrice?: number
}
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: IProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItemToCart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const handleAddToCart = () => {
    addItemToCart({
      // @ts-ignore
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      slug: product.slug,
      quantity: 1,
    })
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    clearCart() // Clear existing items
    addItemToCart({
      // @ts-ignore
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      slug: product.slug,
      quantity: 1,
    })
    router.push("/checkout") // Redirect to checkout
  }

  return (
    <Card className="w-full max-w-xs overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-48 w-full">
          <Image
            src={product.images[0]?.split("?")[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-2 text-lg font-semibold text-white hover:text-purple-300 line-clamp-2">{product.name}</h3>
        </Link>
        <p className="mb-3 text-sm text-gray-400 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-primary">{formatCurrency(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={handleAddToCart} className="w-full">
            Add to Cart
          </Button>
          <Button onClick={handleBuyNow} variant="outline" className="w-full bg-transparent">
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
