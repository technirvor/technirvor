"use client";

import type React from "react";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Trash2, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadOptimizedImage } from "@/lib/image-upload";
import type { Product, Category } from "@/lib/types";
import { toast } from "sonner";
import ImageUpload from "@/components/image-upload";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: string | number;
  image_url: string | File;
  images: (string | File)[];
  category_id: string;
  stock: number;
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_end: string;
  has_free_delivery: boolean;
  free_delivery_note: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface Props {
  product: Product;
  categories: Category[];
}

export default function ProductEditForm({ product, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (!product) {
      console.error("Product prop is missing or null.", product);
      toast.error(
        "Product data is missing. Please reload the page or check the product ID.",
      );
      return {
        name: "",
        slug: "",
        description: "",
        price: 0,
        sale_price: "",
        image_url: "",
        images: [],
        category_id: "",
        stock: 0,
        is_featured: false,
        is_flash_sale: false,
        flash_sale_end: "",
        has_free_delivery: false,
        free_delivery_note: "",
        tags: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
      };
    }
    return {
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      sale_price: product.sale_price || "",
      image_url: product.image_url || "",
      images: Array.isArray(product.images)
        ? product.images.filter((img) => img !== product.image_url)
        : [],
      category_id: product.category_id || "",
      stock: product.stock,
      is_featured: product.is_featured,
      is_flash_sale: product.is_flash_sale,
      flash_sale_end: product.flash_sale_end || "",
      has_free_delivery: (product as any).has_free_delivery || false,
      free_delivery_note: (product as any).free_delivery_note || "",
      tags: product.tags?.join(", ") || "",
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      meta_keywords: product.meta_keywords?.join(", ") || "",
    };
  });

  const mainImagePreview = useMemo(() => {
    const url = formData.image_url;
    if (typeof url === "string") return url;
    if (url instanceof File) return URL.createObjectURL(url);
    return "";
  }, [formData.image_url]);

  const additionalImagesPreview = useMemo(() => {
    return formData.images.map((img) => {
      if (typeof img === "string") return img;
      if (img instanceof File) return URL.createObjectURL(img);
      return "";
    });
  }, [formData.images]);

  useEffect(() => {
    return () => {
      if (mainImagePreview && mainImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(mainImagePreview);
      }
      additionalImagesPreview.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mainImagePreview, additionalImagesPreview]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from name
    if (field === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!product || !product.id) {
        toast.error("Product ID is missing. Cannot update product.");
        setLoading(false);
        return;
      }

      // Handle image uploads first
      const uploadImage = async (image: string | File) => {
        if (typeof image === "string") {
          return image; // Already a URL
        }
        const result = await uploadOptimizedImage(image, {
          folder: "products",
          generateSizes: true,
          uploadProvider: "supabase",
        });
        return result.original.publicUrl;
      };

      const mainImageUrl = await uploadImage(formData.image_url);
      const additionalImages = await Promise.all(
        (formData.images || []).map(uploadImage),
      );

      const updateData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        image_url: mainImageUrl,
        images: additionalImages,
        category_id: formData.category_id || null,
        stock: Number(formData.stock),
        is_featured: formData.is_featured,
        is_flash_sale: formData.is_flash_sale,
        flash_sale_end: formData.flash_sale_end || null,
        has_free_delivery: formData.has_free_delivery,
        free_delivery_note: formData.free_delivery_note || null,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        meta_keywords: formData.meta_keywords
          ? formData.meta_keywords
              .split(",")
              .map((kw) => kw.trim())
              .filter(Boolean)
          : [],
      };

      const { error, data } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", product.id);

      if (error) {
        console.error("Supabase update error:", error, { data });
        toast.error("Failed to update product: " + error.message);
        setLoading(false);
        return;
      }
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        "Failed to update product: " +
          (error instanceof Error ? error.message : String(error)),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);
      if (error) throw error;

      toast.success("Product deleted successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600">Update product information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          handleInputChange("slug", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        handleInputChange("category_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        handleInputChange("tags", e.target.value)
                      }
                      placeholder="electronics, smartphone, android"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">Regular Price (৳) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sale_price">Sale Price (৳)</Label>
                      <Input
                        id="sale_price"
                        type="number"
                        value={formData.sale_price}
                        onChange={(e) =>
                          handleInputChange("sale_price", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          handleInputChange("stock", e.target.value)
                        }
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="is_featured">Featured Product</Label>
                        <p className="text-sm text-gray-600">
                          Show this product in featured sections
                        </p>
                      </div>
                      <Switch
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) =>
                          handleInputChange("is_featured", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="is_flash_sale">Flash Sale</Label>
                        <p className="text-sm text-gray-600">
                          Include in flash sale promotions
                        </p>
                      </div>
                      <Switch
                        id="is_flash_sale"
                        checked={formData.is_flash_sale}
                        onCheckedChange={(checked) =>
                          handleInputChange("is_flash_sale", checked)
                        }
                      />
                    </div>

                    {formData.is_flash_sale && (
                      <div className="space-y-2">
                        <Label htmlFor="flash_sale_end">
                          Flash Sale End Date
                        </Label>
                        <Input
                          id="flash_sale_end"
                          type="datetime-local"
                          value={formData.flash_sale_end}
                          onChange={(e) =>
                            handleInputChange("flash_sale_end", e.target.value)
                          }
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="has_free_delivery">Free Delivery</Label>
                        <p className="text-sm text-gray-600">
                          Offer free delivery for this product
                        </p>
                      </div>
                      <Switch
                        id="has_free_delivery"
                        checked={formData.has_free_delivery}
                        onCheckedChange={(checked) =>
                          handleInputChange("has_free_delivery", checked)
                        }
                      />
                    </div>

                    {formData.has_free_delivery && (
                      <div className="space-y-2">
                        <Label htmlFor="free_delivery_note">
                          Free Delivery Note (Optional)
                        </Label>
                        <Textarea
                          id="free_delivery_note"
                          placeholder="e.g., Free delivery on orders above ৳500"
                          value={formData.free_delivery_note}
                          onChange={(e) =>
                            handleInputChange(
                              "free_delivery_note",
                              e.target.value,
                            )
                          }
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Main Image Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">
                        Main Product Image
                      </Label>
                      {formData.image_url && (
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Main image set
                        </span>
                      )}
                    </div>

                    {mainImagePreview && (
                      <div className="relative">
                        <div className="w-full max-w-md mx-auto">
                          <div className="aspect-square relative overflow-hidden rounded-lg border-2 border-blue-200 bg-gray-50">
                            <img
                              src={mainImagePreview}
                              alt="Main product image"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                Main Image
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-2">
                          This image will be displayed as the primary product
                          image
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="image_url">Main Image URL</Label>
                      <ImageUpload
                        value={formData.image_url ? [formData.image_url] : []}
                        onChange={(files: (string | File)[]) => {
                          handleInputChange("image_url", files[0] || "");
                        }}
                        maxFiles={1}
                        maxSize={5 * 1024 * 1024} // 5MB
                        manualUpload
                        options={{
                          folder: "products",
                          generateSizes: true,
                          uploadProvider: "supabase",
                        }}
                      />
                      <p className="text-sm text-gray-500">
                        Upload the main product image.
                      </p>
                    </div>
                  </div>

                  {/* Additional Images Upload Section */}
                  <div className="space-y-4">
                    <div className="border-t pt-6">
                      <Label className="text-lg font-semibold">
                        Additional Product Images
                      </Label>
                      <p className="text-sm text-gray-600 mt-1 mb-4">
                        Upload and manage additional product images.
                      </p>
                      <ImageUpload
                        value={
                          Array.isArray(formData.images) ? formData.images : []
                        }
                        onChange={(files: (string | File)[]) => {
                          setFormData((prev) => ({
                            ...prev,
                            images: files,
                          }));
                        }}
                        maxFiles={10}
                        maxSize={10 * 1024 * 1024} // 10MB
                        manualUpload
                        options={{
                          folder: "products",
                          generateSizes: true,
                          uploadProvider: "supabase",
                        }}
                      />
                    </div>
                  </div>

                  {/* Additional Images Preview */}
                  {additionalImagesPreview.length > 0 && (
                    <div className="space-y-4">
                      <div className="border-t pt-6">
                        <Label className="text-lg font-semibold">
                          Additional Images Preview
                        </Label>
                        <p className="text-sm text-gray-600 mt-1 mb-4">
                          These images will be shown as additional product
                          photos.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {additionalImagesPreview.map((url, index) => (
                            <div key={url} className="relative">
                              <div className="aspect-square relative overflow-hidden rounded-lg border bg-gray-50">
                                <img
                                  src={url}
                                  alt={`Additional image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2">
                                  <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Meta Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) =>
                        handleInputChange("meta_title", e.target.value)
                      }
                      placeholder="SEO optimized title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) =>
                        handleInputChange("meta_description", e.target.value)
                      }
                      rows={3}
                      placeholder="SEO optimized description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_keywords">
                      Meta Keywords (comma-separated)
                    </Label>
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) =>
                        handleInputChange("meta_keywords", e.target.value)
                      }
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
