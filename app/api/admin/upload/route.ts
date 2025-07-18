import { NextResponse } from "next/server"
import { uploadFileToS3 } from "@/lib/s3"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}` // Unique filename
    const fileUrl = await uploadFileToS3(buffer, fileName, file.type)

    return NextResponse.json({ url: fileUrl }, { status: 200 })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ message: "Failed to upload file" }, { status: 500 })
  }
}
