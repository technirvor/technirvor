"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"
import type { IProduct } from "@/lib/models/product"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Minus, Plus } from "lucide-react"

interface ProductDetailsProps {
  product: IProduct
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addItemToCart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(product.images[0] || "/placeholder.svg")
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Split description by newlines
  const descriptionLines = product.description ? product.description.split(/\r?\n/) : []
  const DESCRIPTION_PREVIEW_LINES = 3
  const isLongDescription = descriptionLines.length > DESCRIPTION_PREVIEW_LINES

  const handleAddToCart = () => {
    addItemToCart({
      //@ts-ignore
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      slug: product.slug,
      quantity: quantity,
    })
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.name} added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    clearCart() // Clear existing items
    addItemToCart({
      //@ts-ignore
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      slug: product.slug,
      quantity: quantity,
    })
    router.push("/checkout") // Redirect to checkout
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  return (
    <Card className="w-full">
      <CardContent className="grid md:grid-cols-2 gap-8 p-6">
        <div className="flex flex-col gap-6 items-center md:items-start">
          <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] md:aspect-[4/3] lg:aspect-[3/2] max-w-lg rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw"
              priority
            />
            {/* Logo placeholder overlay */}
            <div className="absolute bottom-2 right-2 bg-white/80 rounded-full p-2 shadow">
              <Image
          src="/logo/fav-dark.png"
          alt="Logo Placeholder"
          width={32}
          height={32}
          className="object-contain"
              />
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-3 flex-wrap justify-center md:justify-start">
              {product.images.map((img, idx) => (
          <button
            type="button"
            key={img}
            className={`relative aspect-square w-16 h-16 border-2 rounded-lg overflow-hidden focus:outline-none transition-all duration-200 ${
              selectedImage === img
                ? 'border-primary ring-2 ring-primary'
                : 'border-gray-200'
            }`}
            onClick={() => setSelectedImage(img)}
            aria-label={`Show image ${idx + 1}`}
          >
            <Image
              src={img}
              alt={`${product.name} thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              sizes="64px"
            />
            {/* Logo placeholder overlay */}
            <div className="absolute bottom-1 right-1 bg-white/80 rounded-full p-1 shadow">
              <Image
                src="/logo-placeholder.svg"
                alt="Logo Placeholder"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
          </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="text-lg text-primary-600 mb-4 relative">
              {isLongDescription ? (
                <>
                  <div className={
                    !showFullDescription
                      ? "overflow-hidden max-h-24 relative" // adjust max-h as needed
                      : ""
                  } style={{ transition: 'max-height 0.3s' }}>
                    {descriptionLines.slice(0, showFullDescription ? undefined : DESCRIPTION_PREVIEW_LINES).map((line, idx) => (
                      <p key={idx} className="whitespace-pre-line">{line}</p>
                    ))}
                    {!showFullDescription && (
                      <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white/30 to-transparent pointer-events-none rounded-e-md" />
                    )}
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-primary underline focus:outline-none"
                    onClick={() => setShowFullDescription((v) => !v)}
                  >
                    {showFullDescription ? "Show less" : "Show more"}
                  </button>
                </>
              ) : (
                descriptionLines.map((line, idx) => (
                  <p key={idx} className="whitespace-pre-line">{line}</p>
                ))
              )}
            </div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
              {typeof product.originalPrice === "number" && product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>
            <div className="mb-6">
              <p className="text-sm text-primary">
                <span className="font-semibold">Category:</span> {product.category}
              </p>
                {product.brand && (
                <p className="text-sm text-primary">
                  <span className="font-semibold">Brand:</span> {product.brand}
                </p>
                )}
              <p className="text-sm text-primary">
                <span className="font-semibold">Availability:</span>{" "}
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <Label htmlFor="quantity" className="text-lg">
              Quantity:
            </Label>
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="w-16 text-center border-none focus-visible:ring-0"
                min={1}
              />
              <Button variant="ghost" size="icon" onClick={incrementQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleAddToCart} className="flex-1" disabled={product.stock === 0}>
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              variant="outline"
              className="flex-1 bg-transparent"
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}