import { getAllProducts } from "@/lib/products"
import ProductCard from "@/components/product/product-card"

export default async function AllProducts() {
  try {
    const result = await getAllProducts(1, 12)
    const products = result?.products || []

    return (
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">All Products</h2>
          {!products || !Array.isArray(products) || products.length === 0 ? (
            <p className="text-center text-muted-foreground">No products found.</p>
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
    console.error("Error in AllProducts component:", error)
    return (
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">All Products</h2>
          <p className="text-center text-muted-foreground">Unable to load products.</p>
        </div>
      </section>
    )
  }
}
