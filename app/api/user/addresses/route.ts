import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
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

    return NextResponse.json({ addresses: user.addresses })
  } catch (error) {
    console.error("Get addresses error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, phone, address, city, district, postalCode, isDefault } = await request.json()

    if (!name || !phone || !address || !city || !district || !postalCode) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    await connectToDB()

    const user = await UserModel.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false
      })
    }

    // Add new address
    user.addresses.push({
      name,
      phone,
      address,
      city,
      district,
      postalCode,
      isDefault: isDefault || user.addresses.length === 0, // First address is default
    })

    await user.save()

    return NextResponse.json({
      message: "Address added successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    console.error("Add address error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
