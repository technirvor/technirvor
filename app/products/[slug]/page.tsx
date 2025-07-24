import { getProductBySlug, getRelatedProducts } from "@/lib/products"
import Script from "next/script"
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
      canonical: `https://technirvor.com/products/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const awaitedParams = await params
  const { slug } = awaitedParams
  const product = await getProductBySlug(slug)
  
  // Skeleton loader for product details
  const ProductDetailsSkeleton = (
    <div className="animate-pulse flex flex-col md:flex-row gap-8">
      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg w-full md:w-1/2 h-64 mb-4" />
      <div className="flex-1 flex flex-col gap-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2" />
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
      </div>
    </div>
  )
  
  // Skeleton loader for related products
  const RelatedProductsSkeleton = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col animate-pulse shadow-sm">
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        </div>
      ))}
    </div>
  )
  
  if (!product) {
    return (
      <div className="container py-8">
        {ProductDetailsSkeleton}
      </div>
    )
  }

  const relatedProducts = await getRelatedProducts(product._id.toString(), product.category)

  return (
    <>
      {/* Meta Pixel Code */}
      <Script
        id="facebook-pixel-product"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '772937612559753');
            fbq('track', 'PageView');
            fbq('track', 'ViewContent', {
              content_type: 'product',
              content_ids: ['${product._id}'],
              content_name: '${product.name}',
              content_category: '${product.category}',
              value: ${product.price || 0},
              currency: 'BDT'
            });
          `
        }}
      />
      {/* End Meta Pixel Code */}
      
      {/* Meta Pixel NoScript */}
      <noscript>
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }} 
          src="https://www.facebook.com/tr?id=772937612559753&ev=PageView&noscript=1" 
        />
      </noscript>
      {/* End Meta Pixel NoScript */}
      
      <div className="container py-8">
        {/* Show skeleton while product is loading */}
        {!product ? ProductDetailsSkeleton : <ProductDetails product={product} />}
        {/* Show skeleton while related products are loading */}
        {relatedProducts === undefined
          ? RelatedProductsSkeleton
          : relatedProducts.length > 0 && (
            <div className="mt-12">
              <RelatedProducts products={relatedProducts} />
            </div>
          )}
      </div>
    </>
  )
}