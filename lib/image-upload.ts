import { createClient } from "@supabase/supabase-js";

// Use only public keys for client-side compatibility
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
  folder?: string;
}

export interface ImageUploadResult {
  url: string;
  publicUrl: string;
  path: string;
  size: number;
  width: number;
  height: number;
}

// Image compression and optimization
export async function compressImage(
  file: File,
  options: ImageUploadOptions = {},
): Promise<{ blob: Blob; width: number; height: number }> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = "webp",
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        `image/${format}`,
        quality,
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

// Generate multiple image sizes
export async function generateImageSizes(
  file: File,
  sizes: { name: string; width: number; height: number }[] = [
    { name: "thumbnail", width: 150, height: 150 },
    { name: "small", width: 300, height: 300 },
    { name: "medium", width: 600, height: 600 },
    { name: "large", width: 1200, height: 1200 },
  ],
): Promise<{ [key: string]: { blob: Blob; width: number; height: number } }> {
  const results: {
    [key: string]: { blob: Blob; width: number; height: number };
  } = {};

  for (const size of sizes) {
    try {
      const compressed = await compressImage(file, {
        maxWidth: size.width,
        maxHeight: size.height,
        quality: 0.8,
        format: "webp",
      });
      results[size.name] = compressed;
    } catch (error) {
      console.error(`Failed to generate ${size.name} size:`, error);
    }
  }

  return results;
}

// Upload to Supabase Storage
export async function uploadToSupabase(
  file: File | Blob,
  path: string,
  options: { upsert?: boolean } = {},
): Promise<ImageUploadResult> {
  try {
    // Use the correct bucket for product images
    const bucket = "product-images";
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: options.upsert || false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // Get file info
    const fileSize = file instanceof File ? file.size : file.size;

    return {
      url: data.path,
      publicUrl: publicUrlData.publicUrl,
      path: data.path,
      size: fileSize,
      width: 0, // Will be set by caller
      height: 0, // Will be set by caller
    };
  } catch (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }
}

// Upload to Vercel Blob (alternative)
export async function uploadToVercelBlob(
  file: File | Blob,
  filename: string,
): Promise<ImageUploadResult> {
  try {
    const response = await fetch(`/api/upload/blob`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        contentType: "image/webp", // Ensure content type matches the compressed format
      }),
    });

    if (!response.ok) throw new Error("Failed to get upload URL");

    const { uploadUrl, downloadUrl } = await response.json();

    // Upload file to Vercel Blob
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) throw new Error("Failed to upload to Vercel Blob");

    return {
      url: downloadUrl,
      publicUrl: downloadUrl,
      path: filename,
      size: file instanceof File ? file.size : file.size,
      width: 0,
      height: 0,
    };
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    throw error;
  }
}

// Main upload function with optimization
export async function uploadOptimizedImage(
  file: File,
  options: ImageUploadOptions & {
    generateSizes?: boolean;
    uploadProvider?: "supabase" | "vercel";
  } = {},
): Promise<{
  original: ImageUploadResult;
  sizes?: { [key: string]: ImageUploadResult };
}> {
  const {
    folder = "products",
    generateSizes = true,
    uploadProvider = "supabase",
  } = options;

  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      throw new Error("File size must be less than 10MB");
    }

    const timestamp = Date.now();
    const fileExtension = "webp"; // Always convert to WebP
    const baseFilename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}`;

    // Compress original image
    const compressed = await compressImage(file, options);

    // Upload original
    const originalPath = `${baseFilename}.${fileExtension}`;
    const originalUpload =
      uploadProvider === "supabase"
        ? await uploadToSupabase(compressed.blob, originalPath)
        : await uploadToVercelBlob(compressed.blob, originalPath);

    originalUpload.width = compressed.width;
    originalUpload.height = compressed.height;

    const result: {
      original: ImageUploadResult;
      sizes?: { [key: string]: ImageUploadResult };
    } = {
      original: originalUpload,
    };

    // Generate and upload different sizes
    if (generateSizes) {
      const sizes = await generateImageSizes(file);
      const sizeUploads: { [key: string]: ImageUploadResult } = {};

      for (const [sizeName, sizeData] of Object.entries(sizes)) {
        const sizePath = `${baseFilename}-${sizeName}.${fileExtension}`;

        const sizeUpload =
          uploadProvider === "supabase"
            ? await uploadToSupabase(sizeData.blob, sizePath)
            : await uploadToVercelBlob(sizeData.blob, sizePath);

        sizeUpload.width = sizeData.width;
        sizeUpload.height = sizeData.height;
        sizeUploads[sizeName] = sizeUpload;
      }

      result.sizes = sizeUploads;
    }

    return result;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

// Delete image from storage
export async function deleteImage(
  path: string,
  provider: "supabase" | "vercel" = "supabase",
): Promise<void> {
  try {
    if (provider === "supabase") {
      const { error } = await supabase.storage.from("images").remove([path]);

      if (error) throw error;
    } else {
      // For Vercel Blob, you'd need to implement deletion via their API
      await fetch(`/api/upload/blob?path=${encodeURIComponent(path)}`, {
        method: "DELETE",
      });
    }
  } catch (error) {
    console.error("Image deletion error:", error);
    throw error;
  }
}
