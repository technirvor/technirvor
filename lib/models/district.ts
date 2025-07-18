import mongoose, { Schema, models } from "mongoose"

export interface IDistrict {
  _id: mongoose.Types.ObjectId
  name: string
  deliveryCharge: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const districtSchema = new Schema<IDistrict>(
  {
    name: { type: String, required: true, unique: true },
    deliveryCharge: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

const DistrictModel =
  (models.District as mongoose.Model<IDistrict>) || mongoose.model<IDistrict>("District", districtSchema)

export default DistrictModel
