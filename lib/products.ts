import { connectToDB } from "@/lib/db"
import ProductModel, { type IProduct } from "@/lib/models/product"
import CategoryModel from "@/lib/models/category"
import redis from "@/lib/redis"

const CACHE_TTL = 60 * 60 // 1 hour

/* ---------- helpers ------------------------------------------------------ */

async function db() {
  // tiny wrapper so we only call connectToDB() once per request
  try {
    await connectToDB()
  } catch (error) {
    console.error("Database connection error:", error)
    throw error
  }
}

/** Safely handle Redis values that come back as strings. */
function parseCached<T>(data: string | T | null): T | null {
  if (data === null) return null
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as T
    } catch {
      return null
    }
  }
  return data
}

/* ---------- public API --------------------------------------------------- */

export async function getFeaturedProducts(): Promise<IProduct[]> {
  try {
    const key = "featured_products"

    // Try to get from cache first
    try {
      const cached = parseCached<IProduct[]>(await redis.get(key))
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached
      }
    } catch (cacheError) {
      console.warn("Cache read error in getFeaturedProducts:", cacheError)
    }

    await db()
    const products = await ProductModel.find({ featured: true }).limit(8).lean()

    if (!products || !Array.isArray(products)) {
      return []
    }

    const plainProducts = JSON.parse(JSON.stringify(products))

    // Try to cache the result
    try {
      await redis.setex(key, CACHE_TTL, JSON.stringify(plainProducts))
    } catch (cacheError) {
      console.warn("Cache write error in getFeaturedProducts:", cacheError)
    }

    return plainProducts
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error)
    return []
  }
}

export async function getAllProducts(page = 1, limit = 12, category?: string, search?: string) {
  try {
    const key = `all_products_${page}_${limit}_${category ?? "all"}_${search ?? "none"}`

    // Try to get from cache first
    try {
      const cached = parseCached<{
        products: IProduct[]
        total: number
        page: number
        limit: number
        totalPages: number
      }>(await redis.get(key))
      if (cached && cached.products && Array.isArray(cached.products)) {
        return cached
      }
    } catch (cacheError) {
      console.warn("Cache read error in getAllProducts:", cacheError)
    }

    await db()
    const q: Record<string, any> = {}
    if (category && category !== "all") q.category = category
    if (search) {
      q.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const skip = (page - 1) * limit
    const products = await ProductModel.find(q).skip(skip).limit(limit).sort({ createdAt: -1 }).lean()
    const total = await ProductModel.countDocuments(q)

    const plainProducts = products ? JSON.parse(JSON.stringify(products)) : []

    const payload = {
      products: plainProducts,
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit),
    }

    // Try to cache the result
    try {
      await redis.setex(key, CACHE_TTL, JSON.stringify(payload))
    } catch (cacheError) {
      console.warn("Cache write error in getAllProducts:", cacheError)
    }

    return payload
  } catch (error) {
    console.error("Error in getAllProducts:", error)
    return {
      products: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }
}

export async function getProductBySlug(slug: string): Promise<(IProduct & { images: string[] }) | null> {
  try {
    const key = `product_${slug}`

    // Try to get from cache first
    try {
      const cached = parseCached<IProduct & { images: string[] }>(await redis.get(key))
      if (cached) return cached
    } catch (cacheError) {
      console.warn("Cache read error in getProductBySlug:", cacheError)
    }

    await db()
    const product = await ProductModel.findOne({ slug }).lean()
    if (product) {
      // Ensure all images are returned as an array
      const images = Array.isArray(product.images)
        ? product.images
        : product.image
        ? [product.image]
        : []

      const plainProduct = {
        ...JSON.parse(JSON.stringify(product)),
        images,
      }

      // Try to cache the result
      try {
        await redis.setex(key, CACHE_TTL, JSON.stringify(plainProduct))
      } catch (cacheError) {
        console.warn("Cache write error in getProductBySlug:", cacheError)
      }

      return plainProduct
    }
    return null
  } catch (error) {
    console.error("Error in getProductBySlug:", error)
    return null
  }
}

export async function getRelatedProducts(id: string, category: string): Promise<IProduct[]> {
  try {
    const key = `related_${category}_${id}`

    // Try to get from cache first
    try {
      const cached = parseCached<IProduct[]>(await redis.get(key))
      if (cached && Array.isArray(cached)) return cached
    } catch (cacheError) {
      console.warn("Cache read error in getRelatedProducts:", cacheError)
    }

    await db()
    const products = await ProductModel.find({
      category,
      _id: { $ne: id },
    })
      .limit(4)
      .lean()

    if (!products || !Array.isArray(products)) {
      return []
    }

    const plainProducts = JSON.parse(JSON.stringify(products))

    // Try to cache the result
    try {
      await redis.setex(key, CACHE_TTL, JSON.stringify(plainProducts))
    } catch (cacheError) {
      console.warn("Cache write error in getRelatedProducts:", cacheError)
    }

    return plainProducts
  } catch (error) {
    console.error("Error in getRelatedProducts:", error)
    return []
  }
}

export async function getCategories(): Promise<Array<{ name: string; slug: string }>> {
  try {
    const key = "categories_all"

    // Try to get from cache first
    try {
      const cached = parseCached<Array<{ name: string; slug: string }>>(await redis.get(key))
      if (cached && Array.isArray(cached)) return cached
    } catch (cacheError) {
      console.warn("Cache read error in getCategories:", cacheError)
    }

    await db()
    const cats = await CategoryModel.find({}).lean()

    if (!cats || !Array.isArray(cats)) {
      return []
    }

    const plainCats = JSON.parse(JSON.stringify(cats))

    // Try to cache the result
    try {
      await redis.setex(key, CACHE_TTL, JSON.stringify(plainCats))
    } catch (cacheError) {
      console.warn("Cache write error in getCategories:", cacheError)
    }

    return plainCats
  } catch (error) {
    console.error("Error in getCategories:", error)
    return []
  }
}

export async function getProducts(limit?: number): Promise<IProduct[]> {
  try {
    await db()
    const query = ProductModel.find({}).lean()
    if (limit) {
      query.limit(limit)
    }
    const products = await query.exec()

    if (!products || !Array.isArray(products)) {
      return []
    }

    return JSON.parse(JSON.stringify(products))
  } catch (error) {
    console.error("Error in getProducts:", error)
    return []
  }
}
