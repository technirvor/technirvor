import { getAllProducts, getCategories } from "@/lib/products"
import ProductCard from "@/components/product/product-card"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"

interface CategoryProductsPageProps {
  params: { slug: string }
  searchParams: {
    page?: string
    limit?: string
  }
}
export async function generateMetadata({ params }: CategoryProductsPageProps): Promise<Metadata> {
  const { slug: categorySlug } = await params
  const categoryName = categorySlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return {
    title: `${categoryName} Products | Buy ${categoryName} Online at Best Price - Tech Nirvor`,
    description: `Shop the best ${categoryName} products online at Tech Nirvor. Discover top-rated, latest, and trending ${categoryName} electronics and gadgets. Fast shipping, exclusive deals, and unbeatable prices on all ${categoryName} items.`,
    keywords: [
      `${categoryName} products`,
      `buy ${categoryName} online`,
      `${categoryName} deals`,
      `${categoryName} best price`,
      `${categoryName} electronics`,
      `${categoryName} gadgets`,
      "tech nirvor",
      "latest electronics",
      "top-rated gadgets",
      "online shopping"
    ],
    openGraph: {
      title: `${categoryName} Products | Buy ${categoryName} Online at Best Price - Tech Nirvor`,
      description: `Shop the best ${categoryName} products online at Tech Nirvor. Discover top-rated, latest, and trending ${categoryName} electronics and gadgets.`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${categorySlug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} Products | Buy ${categoryName} Online at Best Price - Tech Nirvor`,
      description: `Shop the best ${categoryName} products online at Tech Nirvor. Discover top-rated, latest, and trending ${categoryName} electronics and gadgets.`,
    }
  }
}

export default async function CategoryProductsPage({ params, searchParams }: CategoryProductsPageProps) {
  const { slug: categorySlug } = await params
  const categoryName = categorySlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) // Convert slug to readable name

  const { page: pageParam, limit: limitParam } = await searchParams
  const page = Number.parseInt(pageParam || "1")
  const limit = Number.parseInt(limitParam || "12")

  const { products, totalPages } = await getAllProducts(page, limit, categoryName)

  if (products.length === 0 && page === 1) {
    // Check if the category itself exists
    const allCategories = await getCategories()
    if (!allCategories.some((cat: { name: string }) => cat.name === categoryName)) {
      notFound() // If category doesn't exist, show 404
    }
    return (
      <div className="container py-8 text-center">
        <h1 className="mb-4 text-3xl font-bold">{categoryName} Products</h1>
        <p className="text-muted-foreground">No products found in this category yet.</p>
        <Link href="/products">
          <Button className="mt-4">View All Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold text-center">{categoryName} Products</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product: any) => (
          <ProductCard key={product._id.toString()} product={product} />
        ))}
      </div>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          href={{
            pathname: `/categories/${categorySlug}`,
            query: { page: Math.max(1, page - 1), limit },
          }}
        >
          <Button variant="outline" disabled={page <= 1}>
            Previous
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Link
          href={{
            pathname: `/categories/${categorySlug}`,
            query: { page: page + 1, limit },
          }}
        >
          <Button variant="outline" disabled={page >= totalPages}>
            Next
          </Button>
        </Link>
      </div>
    </div>
  )
}
