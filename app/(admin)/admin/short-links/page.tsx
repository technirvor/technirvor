"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Link,
  Eye,
  MousePointer,
  Calendar,
  Copy,
  ExternalLink,
  Trash2,
  BarChart3,
  Search,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

interface ShortLink {
  id: string;
  short_code: string;
  original_url: string;
  title: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  click_count: number;
  is_active: boolean;
  created_by: string | null;
}

interface CreateShortLinkData {
  original_url: string;
  title: string;
  description: string;
  expires_at: string;
}

export default function ShortLinksAdmin() {
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingShortLink, setCreatingShortLink] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState({
    original_url: "",
    title: "",
    description: "",
    expires_at: "",
  });

  useEffect(() => {
    fetchShortLinks();
    fetchProducts("");

    // Set up real-time subscription for short_links table
    const channel = supabase
      .channel("short_links_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "short_links",
        },
        (payload) => {
          // Update the specific short link in the state
          setShortLinks((prev) =>
            prev.map((link) =>
              link.id === payload.new.id ? { ...link, ...payload.new } : link,
            ),
          );
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchShortLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/short-links", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch short links");
      }

      const data = await response.json();
      setShortLinks(data.short_links || []);
    } catch (error) {
      console.error("Error fetching short links:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch short links",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShortLink = async () => {
    if (!formData.original_url) {
      toast.error("Original URL is required");
      return;
    }

    try {
      setSubmitting(true);

      // Call the API endpoint to create short link
      const response = await fetch("/api/short-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          original_url: formData.original_url,
          title: formData.title || null,
          description: formData.description || null,
          expires_at: formData.expires_at || null,
          created_by: "admin",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create short link");
      }

      const newShortLink = await response.json();
      toast.success("Short link created successfully!");

      // Reset form and close dialog
      setFormData({
        original_url: "",
        title: "",
        description: "",
        expires_at: "",
      });
      setCreateDialogOpen(false);

      // Refresh the list
      fetchShortLinks();
    } catch (error) {
      console.error("Error creating short link:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create short link",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShortLink = async (id: string) => {
    try {
      const response = await fetch(`/api/short-links?id=${id}`, {
        method: "DELETE",
        headers: {
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete short link");
      }

      toast.success("Short link deleted successfully!");
      fetchShortLinks();
    } catch (error) {
      console.error("Error deleting short link:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete short link",
      );
    }
  };

  const fetchProducts = async (search = "") => {
    try {
      setProductsLoading(true);
      const url = new URL("/api/admin/products", window.location.origin);
      if (search) {
        url.searchParams.append("search", search);
      }

      // Get the current session from Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No valid session found");
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching products: " + (error as Error).message);
    } finally {
      setProductsLoading(false);
    }
  };

  const createProductShortLink = async (product: Product) => {
    try {
      setCreatingShortLink(product.id);
      const productUrl = `${window.location.origin}/product/${product.slug}`;

      const response = await fetch("/api/short-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          original_url: productUrl,
          title: product.name,
          description:
            product.description ||
            `Check out ${product.name} - ${product.price} BDT`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create short link");
      }

      const data = await response.json();
      const shortUrl = `${window.location.origin}/s/${data.short_code}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Short link created and copied to clipboard!");

      // Refresh short links list
      fetchShortLinks();
    } catch (error) {
      console.error("Error creating short link:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create short link",
      );
    } finally {
      setCreatingShortLink(null);
    }
  };

  const handleSearchProducts = () => {
    fetchProducts(searchQuery);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getShortUrl = (code: string) => {
    return `${window.location.origin}/s/${code}`;
  };

  const totalClicks = shortLinks.reduce(
    (sum, link) => sum + link.click_count,
    0,
  );
  const activeLinks = shortLinks.filter((link) => link.is_active).length;
  const expiredLinks = shortLinks.filter((link) => {
    if (!link.expires_at) return false;
    return new Date(link.expires_at) < new Date();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Short Links Management
          </h1>
          <p className="text-gray-600">
            Create and manage shortened URLs for your products and pages.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="links" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="links">Short Links</TabsTrigger>
          <TabsTrigger value="products">Create from Products</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-6">
          {/* Create Short Link Button */}
          <div className="flex justify-end">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Short Link
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Short Link</DialogTitle>
                  <DialogDescription>
                    Create a shortened URL for easier sharing and tracking.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="original_url">Original URL *</Label>
                    <Input
                      id="original_url"
                      placeholder="https://example.com/very/long/url"
                      value={formData.original_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          original_url: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      placeholder="Descriptive title for the link"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of what this link leads to"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) =>
                        setFormData({ ...formData, expires_at: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleCreateShortLink}
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Short Link"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Links
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {shortLinks.length}
                    </p>
                  </div>
                  <Link className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Links
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeLinks}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Clicks
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalClicks}
                    </p>
                  </div>
                  <MousePointer className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Expired Links
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {expiredLinks}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Short Links Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Short Links</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading short links...</p>
                </div>
              ) : shortLinks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No short links found. Create your first one!
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Short Code</TableHead>
                      <TableHead>Original URL</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortLinks.map((link) => {
                      const isExpired =
                        link.expires_at &&
                        new Date(link.expires_at) < new Date();
                      const shortUrl = getShortUrl(link.short_code);

                      return (
                        <TableRow key={link.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                {link.short_code}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(shortUrl)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className="max-w-xs truncate"
                              title={link.original_url}
                            >
                              {link.original_url}
                            </div>
                          </TableCell>
                          <TableCell>
                            {link.title || (
                              <span className="text-gray-400">No title</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                              <span>{link.click_count}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isExpired ? (
                              <Badge variant="destructive">Expired</Badge>
                            ) : link.is_active ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(link.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(shortUrl, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Short Link
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this short
                                      link? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteShortLink(link.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Create Short Links from Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchProducts()
                    }
                  />
                </div>
                <Button
                  onClick={handleSearchProducts}
                  disabled={productsLoading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {productsLoading ? "Searching..." : "Search"}
                </Button>
              </div>

              {productsLoading ? (
                <div className="text-center py-8">
                  <p>Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No products found. Try a different search term.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.price} BDT •{" "}
                          {product.category?.name || "No category"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          /product/{product.slug}
                        </p>
                      </div>
                      <Button
                        onClick={() => createProductShortLink(product)}
                        disabled={creatingShortLink === product.id}
                        size="sm"
                      >
                        {creatingShortLink === product.id ? (
                          "Creating..."
                        ) : (
                          <>
                            <Link className="h-4 w-4 mr-2" />
                            Create Short Link
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
