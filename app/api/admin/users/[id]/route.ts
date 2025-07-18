import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import UserModel from "@/lib/models/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { isValidObjectId } from "mongoose"
import bcrypt from "bcryptjs"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    const user = await UserModel.findById(id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return user object without password
    const { password, ...userWithoutPassword } = user.toObject()
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, password, role } = body

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    if (!name || !email || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await UserModel.findOne({ email, _id: { $ne: id } })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    const updateFields: any = { name, email, role }
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateFields, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return user object without password
    const { password: _, ...userWithoutPassword } = updatedUser.toObject()

    return NextResponse.json({ message: "User updated successfully", user: userWithoutPassword })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    const deletedUser = await UserModel.findByIdAndDelete(id)

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
