import { getProductBySlug, getRelatedProducts } from "@/lib/products"
import ProductDetails from "@/components/product/product-details"
import RelatedProducts from "@/components/product/related-products"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const awaitedParams = await params
  const { slug } = awaitedParams
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Product Not Found | Buy Online",
      description: "Sorry, the product you are looking for could not be found. Discover our wide range of products available for fast delivery.",
      robots: "noindex, follow",
      openGraph: {
        title: "Product Not Found | Buy Online",
        description: "Sorry, the product you are looking for could not be found. Discover our wide range of products available for fast delivery.",
        type: "website",
      },
    }
  }

  const image = product.images[0] || "/default-product-image.jpg"
  const keywords = [
    product.name,
    product.category,
    "Buy Online",
    "Best Price",
    "Fast Delivery",
    "Shop Now",
    ...(product.tags || []),
  ].join(", ")

  return {
    title: `${product.name} | ${product.category} | Buy Online at Best Price`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} online. Fast delivery and best prices.`,
    keywords,
    robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    openGraph: {
      title: `${product.name} | ${product.category} | Buy Online`,
      description: product.description,
      images: [image],
      type: "website",
      url: `https://technirvor.com/products/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${product.category} | Buy Online`,
      description: product.description,
      images: [image],
    },
    alternates: {
      canonical: `https://yourdomain.com/products/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const awaitedParams = await params
  const { slug } = awaitedParams
  const product = await getProductBySlug(slug)
  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product._id.toString(), product.category)

  return (
    <div className="container py-8">
      <ProductDetails product={product} />
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          {/* <h2 className="text-2xl font-bold text-center mb-6">Related Products</h2> */}
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  )
}
