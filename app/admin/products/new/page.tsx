"use client"
export const dynamic = "force-dynamic"

import type React from "react"

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

interface Category {
  _id: string
  name: string
  slug: string
}

export default function NewProductPage() {
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
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]) // Declare uploadedUrls variable

  useEffect(() => {
    if (typeof window === "undefined") return
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories")
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        } else {
          console.error("Failed to fetch categories")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (name) {
      setSlug(generateSlug(name))
    }
  }, [name])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i])
    }

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.urls)) {
          setUploadedUrls((prevUrls) => [...prevUrls, ...data.urls])
          setImages((prev) => [...prev, ...data.urls])
          toast({
            title: "Image Uploaded",
            description: "Images uploaded successfully.",
            variant: "default",
          })
        } else if (typeof data.url === "string") {
          setUploadedUrls((prevUrls) => [...prevUrls, data.url])
          setImages((prev) => [...prev, data.url])
          toast({
            title: "Image Uploaded",
            description: "Image uploaded successfully.",
            variant: "default",
          })
        } else {
          toast({
            title: "Upload Failed",
            description: `Unexpected response from server. No image URLs returned. Response: ${JSON.stringify(data)}`,
            variant: "destructive",
          })
          console.error("Upload API did not return an array of URLs or a single URL:", data)
        }
      } else {
        const errorData = await res.json()
        toast({
          title: "Upload Failed",
          description: errorData.message || `Failed to upload images. Response: ${JSON.stringify(errorData)}`,
          variant: "destructive",
        })
        console.error("Upload API error response:", errorData)
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Network error during upload of images.",
        variant: "destructive",
      })
      console.error("Error uploading image:", error)
    }
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
    setLoading(true)

    if (!name || !slug || !description || price === "" || category === "" || stock === "" || images.length === 0) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields and upload at least one image.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
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
          title: "Product Created",
          description: "New product has been added successfully.",
          variant: "default",
        })
        router.push("/admin/products")
      } else {
        const errorData = await res.json()
        toast({
          title: "Creation Failed",
          description: errorData.message || "Failed to create product.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Network error or server issue.",
        variant: "destructive",
      })
      console.error("Error creating product:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>Fill in the details to add a new product to your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={loading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oldPrice">Old Price (Optional)</Label>
                <Input
                  id="oldPrice"
                  type="number"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} disabled={loading}>
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
                <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Product Images</Label>
              <Input id="images" type="file" multiple onChange={handleImageUpload} disabled={loading || uploading} />
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
                      layout="fill"
                      style={{ objectFit: "cover" }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveImage(url)}
                      disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Product...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
