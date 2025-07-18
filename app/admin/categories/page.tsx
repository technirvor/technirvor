"use client"
export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, PlusCircle, Edit, Trash2, RefreshCcw, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { ICategory } from "@/lib/models/category"
import { generateSlug } from "@/lib/utils"
import Image from "next/image"
import Textarea from "@/components/ui/textarea"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<ICategory | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  if (typeof window === "undefined") return null

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to fetch categories.")
      }
    } catch (err) {
      setError("Network error or server issue.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (name && !currentCategory) {
      // Only auto-generate slug for new categories
      setSlug(generateSlug(name))
    }
  }, [name, currentCategory])

  const handleOpenDialog = (category?: ICategory) => {
    setCurrentCategory(category || null)
    setName(category?.name || "")
    setSlug(category?.slug || "")
    setDescription(category?.description || "")
    setImage(category?.image || "")
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setCurrentCategory(null)
    setName("")
    setSlug("")
    setDescription("")
    setImage("")
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setImage(data.url)
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
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (!name || !slug) {
      toast({
        title: "Missing Fields",
        description: "Category name and slug are required.",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }

    const method = currentCategory ? "PUT" : "POST"
    const url = currentCategory ? `/api/admin/categories/${currentCategory._id}` : "/api/admin/categories"

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, slug, description, image }),
      })

      if (res.ok) {
        toast({
          title: currentCategory ? "Category Updated" : "Category Created",
          description: currentCategory ? "Category details updated successfully." : "New category added successfully.",
          variant: "default",
        })
        handleCloseDialog()
        fetchCategories() // Refresh the list
      } else {
        const errorData = await res.json()
        toast({
          title: currentCategory ? "Update Failed" : "Creation Failed",
          description: errorData.message || "Something went wrong.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Operation Failed",
        description: "Network error or server issue.",
        variant: "destructive",
      })
      console.error("Error submitting category:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast({
          title: "Category Deleted",
          description: "Category has been successfully deleted.",
          variant: "default",
        })
        fetchCategories() // Refresh the list
      } else {
        const errorData = await res.json()
        toast({
          title: "Deletion Failed",
          description: errorData.message || "Failed to delete category.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Network error or server issue.",
        variant: "destructive",
      })
      console.error("Error deleting category:", error)
    }
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Category Management
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <Button variant="outline" size="sm" onClick={fetchCategories}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Manage your product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 text-destructive">{error}</div>}

          {categories.length === 0 && !loading ? (
            <p className="text-center text-muted-foreground">No categories found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id.toString()}>
                    <TableCell>
                      {category.image ? (
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          No Img
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {category.description || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(category)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the category and remove its
                                data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category._id.toString())}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {currentCategory ? "Make changes to this category." : "Add a new category to organize your products."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categorySlug">Slug</Label>
              <Input
                id="categorySlug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description (Optional)</Label>
              <Textarea
                id="categoryDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryImage">Image (Optional)</Label>
              <Input id="categoryImage" type="file" onChange={handleImageUpload} disabled={submitting || uploading} />
              {uploading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading image...
                </div>
              )}
              {image && (
                <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                  <Image src={image || "/placeholder.svg"} alt="Category Image" layout="fill" style={{ objectFit: "cover" }} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                    onClick={() => setImage("")}
                    disabled={submitting}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || uploading}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : currentCategory ? (
                  "Save Changes"
                ) : (
                  "Add Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
