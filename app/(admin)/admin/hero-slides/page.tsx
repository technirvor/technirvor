"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Eye,
  ImageIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { HeroSlide } from "@/lib/types";
import { toast } from "sonner";

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    is_active: true,
    order_index: 1,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("order_index");

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error("Error fetching hero slides:", error);
      toast.error("Failed to fetch hero slides");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSlide) {
        // Update existing slide
        const { error } = await supabase
          .from("hero_slides")
          .update(formData)
          .eq("id", editingSlide.id);
        
        if (error) throw error;
        toast.success("Hero slide updated successfully");
      } else {
        // Create new slide
        const { error } = await supabase
          .from("hero_slides")
          .insert([formData]);
        
        if (error) throw error;
        toast.success("Hero slide created successfully");
      }
      
      setIsDialogOpen(false);
      setEditingSlide(null);
      resetForm();
      fetchSlides();
    } catch (error) {
      console.error("Error saving hero slide:", error);
      toast.error("Failed to save hero slide");
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || "",
      image_url: slide.image_url,
      link_url: slide.link_url || "",
      is_active: slide.is_active,
      order_index: slide.order_index,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from("hero_slides")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setSlides(slides.filter((slide) => slide.id !== id));
      toast.success("Hero slide deleted successfully");
    } catch (error) {
      console.error("Error deleting hero slide:", error);
      toast.error("Failed to delete hero slide");
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from("hero_slides")
        .update({ order_index: newOrder })
        .eq("id", id);
      
      if (error) throw error;
      fetchSlides();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("hero_slides")
        .update({ is_active: !isActive })
        .eq("id", id);
      
      if (error) throw error;
      fetchSlides();
      toast.success(`Slide ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error toggling active status:", error);
      toast.error("Failed to update slide status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      is_active: true,
      order_index: slides.length + 1,
    });
  };

  const filteredSlides = slides.filter((slide) =>
    slide.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
          <p className="text-gray-600">Manage homepage banner slides</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingSlide(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order_index">Order</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/products or https://example.com"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSlide ? "Update" : "Create"} Slide
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search slides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Slides Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Hero Slides ({filteredSlides.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSlides.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hero slides found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{slide.order_index}</span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateOrder(slide.id, slide.order_index - 1)}
                            disabled={slide.order_index === 1}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateOrder(slide.id, slide.order_index + 1)}
                            disabled={slide.order_index === slides.length}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative w-16 h-10 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={slide.image_url}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{slide.title}</p>
                        {slide.link_url && (
                          <p className="text-sm text-gray-500">{slide.link_url}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {slide.subtitle || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={slide.is_active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(slide.id, slide.is_active)}
                      >
                        {slide.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(slide)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(slide.id, slide.title)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}