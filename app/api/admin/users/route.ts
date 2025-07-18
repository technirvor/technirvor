import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import UserModel from "@/lib/models/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const role = searchParams.get("role") || "all"
    const search = searchParams.get("search") || ""

    const query: any = {}
    if (role !== "all") {
      query.role = role
    }
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const skip = (page - 1) * limit
    const users = await UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 })
    const total = await UserModel.countDocuments(query)

    return NextResponse.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDB()
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    })

    // Return user object without password
    const { password: _, ...userWithoutPassword } = newUser.toObject()

    return NextResponse.json({ message: "User created successfully", user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
