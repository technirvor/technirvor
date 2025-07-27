"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  ImageIcon,
  Loader2,
  Check,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  uploadOptimizedImage,
  type ImageUploadOptions,
  type ImageUploadResult,
} from "@/lib/image-upload";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[]; // Array of image URLs
  onChange: (urls: string[]) => void; // Callback for when images change
  maxFiles?: number;
  maxSize?: number; // Max file size in bytes
  fileTypes?: string[]; // Allowed file types, e.g., ["image/jpeg", "image/png"]
  options?: ImageUploadOptions & {
    generateSizes?: boolean;
    uploadProvider?: "supabase" | "vercel";
  };
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
  preview: string;
}

export default function ImageUpload({
  value,
  onChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // Default to 10MB
  fileTypes = ["image/*"], // Default to all image types
  options = {},
  className = "",
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      // Check file limits
      if (value.length + uploadingFiles.length + fileArray.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      // Validate files
      const validFiles = fileArray.filter((file) => {
        if (fileTypes.length > 0 && !fileTypes.some(type => {
          if (type.endsWith("/*")) {
            const baseType = type.slice(0, -2);
            return file.type.startsWith(baseType);
          }
          return file.type === type;
        })) {
          toast.error(`${file.name} is not a supported file type.`);
          return false;
        }
        if (file.size > maxSize) {
          toast.error(
            `${file.name} is too large (max ${Math.round(
              maxSize / 1024 / 1024,
            )}MB)`,
          );
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Create uploading file objects
      const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
        preview: URL.createObjectURL(file),
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Upload files
      for (let i = 0; i < newUploadingFiles.length; i++) {
        const uploadingFile = newUploadingFiles[i];

        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.file === uploadingFile.file && f.progress < 90
                  ? { ...f, progress: f.progress + 10 }
                  : f,
              ),
            );
          }, 200);

          const result = await uploadOptimizedImage(
            uploadingFile.file,
            options,
          );

          clearInterval(progressInterval);

          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === uploadingFile.file
                ? { ...f, progress: 100, status: "success" }
                : f,
            ),
          );

          // Add the new image URL to the value array
          onChange([...value, result.original.publicUrl]);
          toast.success(`${uploadingFile.file.name} uploaded successfully`);
        } catch (error: any) {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === uploadingFile.file
                ? { ...f, status: "error", error: error.message }
                : f,
            ),
          );
          toast.error(
            `Failed to upload ${uploadingFile.file.name}: ${error.message}`,
          );
        }
      }
    },
    [
      value,
      uploadingFiles.length,
      maxFiles,
      maxSize,
      fileTypes,
      options,
      onChange,
    ],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles],
  );

  const removeUploadingFile = (file: File) => {
    setUploadingFiles((prev) => {
      const updated = prev.filter((f) => f.file !== file);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find((f) => f.file === file);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const removeImage = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  const canUploadMore = value.length + uploadingFiles.length < maxFiles;

  const acceptedFileTypes = fileTypes.join(",");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canUploadMore && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Images
              </h3>

              <p className="text-gray-600 mb-4">
                Drag and drop images here, or click to select files
              </p>

              <div className="flex items-center justify-center space-x-4 mb-4">
                <Badge variant="outline">WebP Optimized</Badge>
                <Badge variant="outline">Multiple Sizes</Badge>
                <Badge variant="outline">
                  Max {Math.round(maxSize / 1024 / 1024)}MB
                </Badge>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="mb-2"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose Images
              </Button>

              <p className="text-sm text-gray-500">
                {value.length + uploadingFiles.length} of {maxFiles} images
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedFileTypes}
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Images */}
      {value.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Current Images
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(url)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Uploading Images
          </h4>
          <div className="space-y-3">
            {uploadingFiles.map((uploadingFile, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 relative overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                    <Image
                      src={uploadingFile.preview || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadingFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {uploadingFile.status === "uploading" && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        )}
                        {uploadingFile.status === "success" && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        {uploadingFile.status === "error" && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            removeUploadingFile(uploadingFile.file)
                          }
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {uploadingFile.status === "uploading" && (
                      <div className="space-y-1">
                        <Progress
                          value={uploadingFile.progress}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500">
                          {uploadingFile.progress}% uploaded
                        </p>
                      </div>
                    )}

                    {uploadingFile.status === "success" && (
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          Uploaded
                        </Badge>
                        {/* Removed uploadingFile.result?.sizes */}
                      </div>
                    )}

                    {uploadingFile.status === "error" && (
                      <p className="text-xs text-red-600">
                        {uploadingFile.error}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
