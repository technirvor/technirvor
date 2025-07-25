import { type NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { validateRequest } from "@/lib/api-security";

// Use validateRequest for admin access
async function validateAdminAccess(request: NextRequest) {
  return validateRequest(request, { requireAdmin: true });
}

export async function POST(request: NextRequest) {
  try {
    const { isValid, error } = await validateAdminAccess(request);
    if (!isValid) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and content type required" },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename}`;

    const blob = await put(uniqueFilename, Buffer.alloc(0), {
      access: "public",
      contentType,
    });

    return NextResponse.json({
      uploadUrl: blob.url,
      downloadUrl: blob.url,
    });
  } catch (error) {
    console.error("Blob upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { isValid, error } = await validateAdminAccess(request);
    if (!isValid) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    await del(path);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blob deletion error:", error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
