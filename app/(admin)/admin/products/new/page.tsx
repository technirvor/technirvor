"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/image-upload"; // Import ImageUpload
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
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    price: string;
    salePrice: string;
    imageUrl: string;
    images: string[];
    categoryId: string;
    stockQuantity: string;
    isFeatured: boolean;
    isFlashSale: boolean;
    flashSaleEnd: string;
    tags: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  }>({
    name: "",
    slug: "",
    description: "",
    price: "",
    salePrice: "",
    imageUrl: "",
    images: [],
    categoryId: "",
    stockQuantity: "",
    isFeatured: false,
    isFlashSale: false,
    flashSaleEnd: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name") {
        updated.slug = generateSlug(value as string);
        // Auto-generate SEO fields
        updated.metaTitle = `${value} - Best Price in Bangladesh | Tech Nirvor`;
        updated.metaDescription = `Buy ${value} online in Bangladesh. Best price guaranteed. Cash on delivery available. Fast shipping across Bangladesh.`;
      }
      return updated;
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return false;
    }
    if (!formData.imageUrl.trim()) {
      toast.error("Product image URL is required");
      return false;
    }
    if (!formData.categoryId) {
      toast.error("Category is required");
      return false;
    }
    if (
      !formData.stockQuantity ||
      Number.parseInt(formData.stockQuantity) < 0
    ) {
      toast.error("Valid stock quantity is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        sale_price: formData.salePrice
          ? Number.parseFloat(formData.salePrice)
          : null,
        image_url: formData.imageUrl,
        images:
          formData.images.length > 0 ? formData.images : [formData.imageUrl],
        category_id: formData.categoryId,
        stock: Number.parseInt(formData.stockQuantity),
        is_featured: formData.isFeatured,
        is_flash_sale: formData.isFlashSale,
        flash_sale_end: formData.flashSaleEnd || null,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        meta_title: formData.metaTitle,
        meta_description: formData.metaDescription,
        meta_keywords: formData.metaKeywords
          .split(",")
          .map((kw) => kw.trim())
          .filter(Boolean),
      };

      const { error } = await supabase.from("products").insert(productData);

      if (error) throw error;

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">
            Create a new product with proper stock management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
              <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          handleInputChange("slug", e.target.value)
                        }
                        placeholder="product-slug"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        handleInputChange("categoryId", value)
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

                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      type="text"
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

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Product Media</CardTitle>
                  <p className="text-sm text-gray-600">
                    Add product images and media files.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main Image */}
                  <div>
                    <Label>Main Product Image *</Label>
                    <ImageUpload
                      value={formData.imageUrl ? [formData.imageUrl] : []}
                      onChange={(urls) =>
                        setFormData((prev) => ({
                          ...prev,
                          imageUrl: urls[0] || "",
                        }))
                      }
                      maxFiles={1}
                      options={{
                        folder: "products",
                        uploadProvider: "supabase",
                      }}
                    />
                  </div>

                  {/* Additional Images */}
                  <div>
                    <Label>Additional Product Images</Label>
                    <ImageUpload
                      value={formData.images}
                      onChange={(urls) =>
                        setFormData((prev) => ({ ...prev, images: urls }))
                      }
                      maxFiles={5} // Example: allow up to 5 additional images
                      options={{
                        folder: "products",
                        uploadProvider: "supabase",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="price">Price (৳) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="salePrice">Sale Price (৳)</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(e) =>
                          handleInputChange("salePrice", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={(e) =>
                          handleInputChange("stockQuantity", e.target.value)
                        }
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Stock will be automatically managed when orders are
                        placed
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) =>
                          handleInputChange("isFeatured", checked)
                        }
                      />
                      <Label htmlFor="featured">Featured Product</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="flashSale"
                        checked={formData.isFlashSale}
                        onCheckedChange={(checked) =>
                          handleInputChange("isFlashSale", checked)
                        }
                      />
                      <Label htmlFor="flashSale">Flash Sale</Label>
                    </div>
                  </div>

                  {formData.isFlashSale && (
                    <div>
                      <Label htmlFor="flashSaleEnd">Flash Sale End Date</Label>
                      <Input
                        id="flashSaleEnd"
                        type="datetime-local"
                        value={formData.flashSaleEnd}
                        onChange={(e) =>
                          handleInputChange("flashSaleEnd", e.target.value)
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Meta Information</CardTitle>
                  <p className="text-sm text-gray-600">
                    Optimize your product for search engines and social media
                    sharing.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        handleInputChange("metaTitle", e.target.value)
                      }
                      placeholder="SEO optimized title"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) =>
                        handleInputChange("metaDescription", e.target.value)
                      }
                      placeholder="SEO optimized description"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="metaKeywords">
                      Meta Keywords (comma separated)
                    </Label>
                    <Input
                      id="metaKeywords"
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) =>
                        handleInputChange("metaKeywords", e.target.value)
                      }
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-8">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Creating..." : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
