"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import ProductCard from "@/components/product/product-card"

async function fetchProducts(page = 1, limit = 12) {
  const res = await fetch(`/api/v1/products?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error("Failed to fetch products")
  return await res.json()
}

export default function AllProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loader = useRef<HTMLDivElement | null>(null)

  const loadProducts = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const result = await fetchProducts(page, 12)
      if (result.products && Array.isArray(result.products)) {
        setProducts((prev) => [...prev, ...result.products])
        setHasMore(page < result.totalPages)
        setPage((prev) => prev + 1)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [page, hasMore, loading])

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasMore || loading) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadProducts()
      }
    }, { threshold: 1 })
    if (loader.current) {
      observer.observe(loader.current)
    }
    return () => {
      if (loader.current) observer.unobserve(loader.current)
    }
  }, [loadProducts, hasMore, loading])

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8">All Products</h2>
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
        <div ref={loader} className="flex justify-center items-center py-8">
          {loading && <span className="text-muted-foreground">Loading more products...</span>}
          {!hasMore && products.length > 0 && <span className="text-muted-foreground">No more products.</span>}
        </div>
      </div>
    </section>
  )
}
