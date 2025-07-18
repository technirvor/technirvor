import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/products" // Corrected import

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category") || undefined
    const search = searchParams.get("search") || undefined

    const { products, total, totalPages } = await getAllProducts(page, limit, category, search)

    return NextResponse.json({ products, total, page, limit, totalPages })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Failed to fetch products", error }, { status: 500 })
  }
}
