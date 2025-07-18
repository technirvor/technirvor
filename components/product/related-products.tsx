import ProductCard from "@/components/product/product-card"
import type { IProduct } from "@/lib/models/product"

interface RelatedProductsProps {
  products: IProduct[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="w-full py-12">
      <div className="container">
        <h2 className="section-title">Related Products</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id.toString()} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
