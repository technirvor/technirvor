import mongoose, { Schema, models } from "mongoose"

export interface IProduct {
  originalPrice: boolean
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description: string
  price: number
  oldPrice?: number
  category: string
  brand?: string
  stock: number
  images: string[]
  featured: boolean
  rating: number
  reviews: number
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    category: { type: String, required: true },
    brand: { type: String },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String, required: true }],
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  },
)

const ProductModel = (models.Product as mongoose.Model<IProduct>) || mongoose.model<IProduct>("Product", productSchema)

export default ProductModel
