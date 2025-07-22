import { getAllProducts } from "@/lib/products"
import ProductCard from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

interface ProductsPageProps {
  searchParams: {
    page?: string
    category?: string
    search?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { page: pageParam, category, search } = await searchParams
  const page = Number.parseInt(pageParam || "1")

  try {
    const result = await getAllProducts(page, 12, category, search)
    const { products, totalPages, total } = result
    // Skeleton loader for products grid
    const ProductsSkeleton = (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col animate-pulse shadow-sm">
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          </div>
        ))}
      </div>
    )
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">All Products</h1>
            {search && (
              <p className="text-muted-foreground mt-2">
                Search results for "{search}" ({total} products found)
              </p>
            )}
            {category && (
              <p className="text-muted-foreground mt-2">
                Category: {category} ({total} products found)
              </p>
            )}
          </div>
        </div>

        {/* Show skeleton if products is undefined (simulate loading) */}
        {!products ? (
          ProductsSkeleton
        ) : !Array.isArray(products) || products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products found.</p>
            <Link href="/products">
              <Button>View All Products</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button variant="outline" disabled={page <= 1} asChild>
                  <Link
                    href={`/products?page=${page - 1}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Link>
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" disabled={page >= totalPages} asChild>
                  <Link
                    href={`/products?page=${page + 1}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error in ProductsPage:", error)
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        <p className="text-center text-muted-foreground">Unable to load products.</p>
      </div>
    )
  }
}
