import ProductCard from "@/components/product/product-card"
import { getFeaturedProducts } from "@/lib/products"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function FeaturedProducts() {
  try {
    const products = await getFeaturedProducts()

    return (
      <section className="py-12 md:py-16 lg:py-20 bg-muted/40">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {!products || !Array.isArray(products) || products.length === 0 ? (
            <p className="text-center text-muted-foreground">No featured products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    )
  } catch (error) {
    console.error("Error in FeaturedProducts component:", error)
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-muted/40">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <p className="text-center text-muted-foreground">Unable to load featured products.</p>
        </div>
      </section>
    )
  }
}
