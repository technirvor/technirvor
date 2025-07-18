export const dynamic = "force-dynamic" // Force dynamic rendering for this route
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import CategoryModel from "@/lib/models/category"
import redis from "@/lib/redis"

const CACHE_TTL = 60 * 60 // Cache for 1 hour

export async function GET() {
  try {
    const cacheKey = "all_categories_api"
    const cachedCategories = await redis.get<string[]>(cacheKey)

    if (cachedCategories) {
      console.log("Serving categories from API cache.")
      return NextResponse.json(cachedCategories)
    }

    await connectToDB()
    const categories = await CategoryModel.find({}).sort({ name: 1 }).lean()
    const categoryNames = categories.map((cat) => cat.name)

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(categoryNames))
    console.log("Fetched categories from DB and cached for API.")
    return NextResponse.json(categoryNames)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
