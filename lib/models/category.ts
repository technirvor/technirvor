import mongoose, { Schema, models } from "mongoose"

export interface ICategory {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
  },
  {
    timestamps: true,
  },
)

const CategoryModel =
  (models.Category as mongoose.Model<ICategory>) || mongoose.model<ICategory>("Category", categorySchema)

export default CategoryModel
