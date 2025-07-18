import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { getCategories } from "@/lib/products"

export default async function CategoryScroll() {
  try {
    const categories = await getCategories()
    return (
      <section className="w-full py-12">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="flex overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-4 min-w-max">
              {!categories || !Array.isArray(categories) || categories.length === 0 ? (
                <p className="text-muted-foreground px-4">No categories found.</p>
              ) : (
                categories.map(
                  (
                    category: string | { name?: string; slug?: string; image?: string },
                    index: number
                  ) => {
                    const name = typeof category === "string" ? category : category?.name || "Unknown"
                    const slug =
                      typeof category === "string"
                        ? category.toLowerCase().replace(/\s+/g, "-")
                        : category?.slug || name.toLowerCase().replace(/\s+/g, "-")

                    return (
                      <Link href={`/categories/${slug}`} key={slug || index}>
                        <Card className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow">
                          <CardContent className="flex flex-col items-center justify-center p-4">
                            <Image
                              src={
                                typeof category === "object" && category?.image
                                  ? category.image
                                  : `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(
                                      name.split(" ")[0]
                                    )}`
                              }
                              alt={name}
                              width={64}
                              height={64}
                              className="mb-2 rounded-full object-cover"
                            />
                            <p className="text-sm font-medium">{name}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  }
                )
              )}
            </div>
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error("Error in CategoryScroll component:", error)
    return (
      <section className="w-full py-12">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="text-muted-foreground px-4">Unable to load categories.</p>
        </div>
      </section>
    )
  }
}
