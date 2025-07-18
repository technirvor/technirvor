import mongoose, { Schema, models } from "mongoose"
import type { User } from "next-auth"

export interface IAddress {
  _id?: string
  name: string
  phone: string
  address: string
  city: string
  district: string
  postalCode: string
  isDefault: boolean
}

export interface IUser extends User {
  role: "user" | "admin"
  password?: string
  phone?: string
  addresses: IAddress[]
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  emailVerified?: Date
  isEmailVerified: boolean
}

const addressSchema = new Schema<IAddress>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, required: false }, // Optional but unique
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [addressSchema],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    emailVerified: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

const UserModel = (models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema)

export default UserModel
