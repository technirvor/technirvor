import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { connectToDB } from "@/lib/db"
import UserModel from "@/lib/models/user"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    await connectToDB()
    const user = await UserModel.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    const { password, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitiveData } = user.toObject()
    return NextResponse.json({ user: userWithoutSensitiveData })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const { name, email, phone, currentPassword, newPassword } = await request.json()
    if (!name || !phone) {
      return NextResponse.json({ message: "Name and phone are required" }, { status: 400 })
    }
    await connectToDB()
    const user = await UserModel.findById(session.user.id).select("+password")
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    // Check if phone is already taken by another user
    if (phone !== user.phone) {
      const existingUser = await UserModel.findOne({
        phone,
        _id: { $ne: session.user.id },
      })
      if (existingUser) {
        return NextResponse.json({ message: "Phone number already in use" }, { status: 400 })
      }
    }
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await UserModel.findOne({
        email,
        _id: { $ne: session.user.id },
      })
      if (existingUser) {
        return NextResponse.json({ message: "Email already in use" }, { status: 400 })
      }
    }
    const updateData: any = {
      name,
      phone,
      email: email || undefined,
    }
    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: "Current password is required to set new password" }, { status: 400 })
      }
      if (!user.password) {
        return NextResponse.json({ message: "Current password not set for user" }, { status: 400 })
      }
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password as string)
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ message: "New password must be at least 6 characters long" }, { status: 400 })
      }
      updateData.password = await bcrypt.hash(newPassword, 12)
    }
    const updatedUser = await UserModel.findByIdAndUpdate(session.user.id, updateData, { new: true })
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found after update" }, { status: 404 })
    }
    const { password, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitiveData } = updatedUser.toObject()
    return NextResponse.json({
      message: "Profile updated successfully",
      user: userWithoutSensitiveData,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
