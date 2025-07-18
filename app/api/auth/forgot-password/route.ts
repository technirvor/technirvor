import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { connectToDB } from "@/lib/db"
import UserModel from "@/lib/models/user"

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json() // Can be email or phone

    if (!identifier) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    await connectToDB()

    // Find user by email or phone
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    })

    if (!user) {
      return NextResponse.json({ message: "No account found with this email or phone number" }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to user
    await UserModel.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry,
    })

    // In a real app, you would send an email or SMS here
    // For now, we'll just return the token (remove this in production)
    return NextResponse.json({
      message: "Password reset instructions sent",
      resetToken, // Remove this in production
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
