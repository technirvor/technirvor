import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/products"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "12", 10)
  const category = searchParams.get("category") || undefined
  const search = searchParams.get("search") || undefined

  try {
    const result = await getAllProducts(page, limit, category, search)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ products: [], total: 0, page, limit, totalPages: 0 }, { status: 500 })
  }
}
