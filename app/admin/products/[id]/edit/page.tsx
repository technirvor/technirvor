"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { generateSlug } from "@/lib/utils"
import type { IProduct } from "@/lib/models/product"

interface Category {
  _id: string
  name: string
  slug: string
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params with React.use(params) as required by the new Next.js API.
  const { id: productId } = React.use(params)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [oldPrice, setOldPrice] = useState<number | "">("")
  const [category, setCategory] = useState("")
  const [brand, setBrand] = useState("")
  const [stock, setStock] = useState<number | "">("")
  const [images, setImages] = useState<string[]>([])
  const [featured, setFeatured] = useState(false)
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(true) // Initial loading for fetching product
  const [submitting, setSubmitting] = useState(false) // For form submission
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch product data
        const productRes = await fetch(`/api/admin/products/${productId}`)
        if (productRes.ok) {
          const productData: IProduct = await productRes.json()
          setName(productData.name)
          setSlug(productData.slug)
          setDescription(productData.description)
          setPrice(productData.price)
          setOldPrice(productData.oldPrice || "")
          setCategory(productData.category)
          setBrand(productData.brand || "")
          setStock(productData.stock)
          setImages(productData.images)
          setFeatured(productData.featured)
          setTags(productData.tags?.join(", ") || "")
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch product data.",
            variant: "destructive",
          })
          router.push("/admin/products") // Redirect if product not found
          return
        }

        // Fetch categories
        const categoriesRes = await fetch("/api/admin/categories")
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data)
        } else {
          console.error("Failed to fetch categories")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Network error or server issue while fetching data.",
          variant: "destructive",
        })
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [productId, router, toast])

  useEffect(() => {
    if (name && !slug) {
      // Only auto-generate slug if it's empty
      setSlug(generateSlug(name))
    }
  }, [name, slug])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          uploadedUrls.push(data.url)
          toast({
            title: "Image Uploaded",
            description: `${file.name} uploaded successfully.`,
          })
        } else {
          const errorData = await res.json()
          toast({
            title: "Upload Failed",
            description: errorData.message || `Failed to upload ${file.name}.`,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Upload Error",
          description: `Network error during upload of ${file.name}.`,
          variant: "destructive",
        })
        console.error("Error uploading image:", error)
      }
    }
    setImages((prev) => [...prev, ...uploadedUrls])
    setUploading(false)
  }

  const handleRemoveImage = (urlToRemove: string) => {
    setImages((prev) => prev.filter((url) => url !== urlToRemove))
    toast({
      title: "Image Removed",
      description: "Image removed from product.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (!name || !slug || !description || price === "" || category === "" || stock === "" || images.length === 0) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields and upload at least one image.",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: Number(price),
          oldPrice: oldPrice === "" ? undefined : Number(oldPrice),
          category,
          brand,
          stock: Number(stock),
          images,
          featured,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      if (res.ok) {
        toast({
          title: "Product Updated",
          description: "Product details have been updated successfully.",
          variant: "default",
        })
        router.push("/admin/products")
      } else {
        const errorData = await res.json()
        toast({
          title: "Update Failed",
          description: errorData.message || "Failed to update product.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Network error or server issue.",
        variant: "destructive",
      })
      console.error("Error updating product:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading product data...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>Update the details for this product.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (BDT)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oldPrice">Old Price (Optional)</Label>
                <Input
                  id="oldPrice"
                  type="number"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} disabled={submitting}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand (Optional)</Label>
                <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Product Images</Label>
              <Input id="images" type="file" multiple onChange={handleImageUpload} disabled={submitting || uploading} />
              {uploading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading images...
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((url, index) => (
                  <div key={index} className="relative h-24 w-24 overflow-hidden rounded-md border">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`Product Image ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveImage(url)}
                      disabled={submitting}
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={featured}
                onCheckedChange={(checked) => setFeatured(Boolean(checked))}
                disabled={submitting}
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., smartphone, android, flagship"
                disabled={submitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting || uploading}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Product...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
