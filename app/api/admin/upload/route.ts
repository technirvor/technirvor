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
    const files = formData.getAll("file") as File[]
    const folder = (formData.get("folder") as string)?.trim() || "uploads"

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    const urls: string[] = []
    for (const file of files) {
      if (!file) continue
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`
      const s3Path = `${folder}/${fileName}`
      const fileUrl = await uploadFileToS3(buffer, s3Path, file.type)
      urls.push(fileUrl)
    }

    return NextResponse.json({ urls }, { status: 200 })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ message: "Failed to upload file" }, { status: 500 })
  }
}
