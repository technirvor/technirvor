import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import DistrictModel from "@/lib/models/district"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: Request) {
  try {
    await connectToDB()    
    const districts = await DistrictModel.find({}).sort({ name: 1 })
    return NextResponse.json(districts)
  } catch (error) {
    console.error("Error fetching districts:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
