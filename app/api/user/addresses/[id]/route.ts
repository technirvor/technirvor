import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDB } from "@/lib/db"
import UserModel from "@/lib/models/user"
import { authOptions } from "@/lib/auth-options"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const addressIndex = user.addresses.findIndex((addr) => addr._id?.toString() === params.id)
    if (addressIndex === -1) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 })
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false
      })
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      name,
      phone,
      address,
      city,
      district,
      postalCode,
      isDefault,
    }

    await user.save()

    return NextResponse.json({
      message: "Address updated successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    console.error("Update address error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const addressIndex = user.addresses.findIndex((addr) => addr._id?.toString() === params.id)
    if (addressIndex === -1) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 })
    }

    const wasDefault = user.addresses[addressIndex].isDefault

    // Remove address
    user.addresses.splice(addressIndex, 1)

    // If the deleted address was default and there are other addresses, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true
    }

    await user.save()

    return NextResponse.json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    console.error("Delete address error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
