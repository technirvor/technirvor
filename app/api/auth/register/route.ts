import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDB } from "@/lib/db"
import UserModel from "@/lib/models/user"

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password } = await request.json()

    if (!name || !phone || !password) {
      return NextResponse.json({ message: "Name, phone, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

    await connectToDB()

    // Check if user already exists with phone
    const existingUserByPhone = await UserModel.findOne({ phone })
    if (existingUserByPhone) {
      return NextResponse.json({ message: "User with this phone number already exists" }, { status: 400 })
    }

    // Check if user already exists with email (if provided)
    if (email) {
      const existingUserByEmail = await UserModel.findOne({ email })
      if (existingUserByEmail) {
        return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Prepare user data
    // Only include email if provided
    const userData: any = {
      name,
      phone,
      password: hashedPassword,
      role: "user",
      addresses: [],
      isEmailVerified: false,
    }
    if (email && email !== null && email !== undefined && email !== "") {
      userData.email = email
    }
    // Create user
    const user = await UserModel.create(userData)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
