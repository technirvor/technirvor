
import { getCategories } from "@/lib/products"
import CategoryScrollClient from "./CategoryScrollClient"

export default async function CategoryScroll() {
  try {
    const categories = await getCategories()
    return <CategoryScrollClient categories={categories} />
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
