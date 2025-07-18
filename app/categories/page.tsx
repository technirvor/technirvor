import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { getCategories } from "@/lib/products"

export const dynamic = "force-dynamic"

type Category = {
  name: string
  slug: string
  image?: string
} | string

export default async function CategoriesPage() {
  try {
    const categories: Category[] = await getCategories()
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">All Categories</h1>
        {!categories || !Array.isArray(categories) || categories.length === 0 ? (
          <p className="text-center text-muted-foreground">No categories found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              // Handle both string and object formats
              const name = typeof category === "string" ? category : category?.name || "Unknown"
              const slug =
                typeof category === "string"
                  ? category.toLowerCase().replace(/\s+/g, "-")
                  : category?.slug || name.toLowerCase().replace(/\s+/g, "-")

              return (
                <Link href={`/categories/${slug}`} key={slug || index}>
                  <Card className="h-48 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <Image
                      src={
                        typeof category === "object" && category.image
                        ? category.image
                        : `/placeholder.svg?height=80&width=80&text=${encodeURIComponent(name.split(" ")[0])}`
                      }
                      alt={name}
                      width={80}
                      height={80}
                      className="mb-4 rounded-full object-cover"
                      />
                      <h3 className="text-lg font-semibold">{name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error in CategoriesPage:", error)
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">All Categories</h1>
        <p className="text-center text-muted-foreground">Unable to load categories.</p>
      </div>
    )
  }
}
