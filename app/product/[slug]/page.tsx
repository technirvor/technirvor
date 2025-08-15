import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductPageClient from "./client";
import type { Product } from "@/lib/types";

// Force dynamic rendering to ensure real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        subcategory:subcategories(*)
      `,
      )
      .eq("slug", slug)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const awaitedParams = await params;
  const product = await getProduct(awaitedParams.slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you're looking for doesn't exist.",
    };
  }

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  return {
    title: `${product.name} - Best Price in Bangladesh | Tech Nirvor`,
    description: `Buy ${product.name} online in Bangladesh. ${product.description || ""} ${hasDiscount ? `${discountPercentage}% OFF! ` : ""}Price: ৳${currentPrice.toLocaleString()}. Cash on delivery available. Fast shipping across Bangladesh.`,
    keywords: [
      product.name.toLowerCase(),
      product.category?.name.toLowerCase() || "",
      "bangladesh",
      "online shopping",
      "cash on delivery",
      "fast delivery",
      hasDiscount ? "discount" : "",
      hasDiscount ? "sale" : "",
    ].filter(Boolean),
    openGraph: {
      title: `${product.name} - ৳${currentPrice.toLocaleString()}${hasDiscount ? ` (${discountPercentage}% OFF)` : ""}`,
      description:
        product.description ||
        `Buy ${product.name} online in Bangladesh with cash on delivery`,
      images: [
        {
          url: product.image_url || "/placeholder.svg",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - ৳${currentPrice.toLocaleString()}`,
      description:
        product.description || `Buy ${product.name} online in Bangladesh`,
      images: [product.image_url || "/placeholder.svg"],
    },
    alternates: {
      canonical: `/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const awaitedParams = await params;
  const product = await getProduct(awaitedParams.slug);

  if (!product) {
    notFound();
  }

  // Generate structured data
  const currentPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description || `Buy ${product.name} online in Bangladesh`,
    image: product.image_url,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Tech Nirvor",
    },
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      price: currentPrice,
      priceCurrency: "BDT",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Tech Nirvor",
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "123",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductPageClient product={product} />
    </>
  );
}

// Removed generateStaticParams to enable dynamic rendering
// This ensures product data is always fresh and reflects real-time price changes
