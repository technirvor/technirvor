"use client"
export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, PlusCircle, Edit, Trash2, Search, RefreshCcw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
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
import type { IProduct } from "@/lib/models/product"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const res = await fetch(`/api/admin/products?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
        setTotalProducts(data.total)
        setTotalPages(data.totalPages)
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to fetch products.")
      }
    } catch (err) {
      setError("Network error or server issue.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast({
          title: "Product Deleted",
          description: "Product has been successfully deleted.",
          variant: "success",
        })
        fetchProducts() // Refresh the list
      } else {
        const errorData = await res.json()
        toast({
          title: "Deletion Failed",
          description: errorData.message || "Failed to delete product.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Network error or server issue.",
        variant: "destructive",
      })
      console.error("Error deleting product:", error)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
    fetchProducts()
  }

  const handleRefresh = () => {
    setPage(1)
    setLimit(10)
    setSearchQuery("")
    fetchProducts()
  }

  if (typeof window === "undefined") return null

  if (loading && products.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Product Management
            <div className="flex gap-2">
              <Link href="/admin/products/new">
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Manage your store&apos;s products.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
          </div>

          {error && <div className="mb-4 text-destructive">{error}</div>}

          {products.length === 0 && !loading ? (
            <p className="text-center text-muted-foreground">No products found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id.toString()}>
                      <TableCell>
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/${product._id}/edit`}>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
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
                                  This action cannot be undone. This will permanently delete the product and remove its
                                  data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product._id.toString())}>
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
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({totalProducts} products)
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
