'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  category: Category;
}

export default function CategoryEditForm({ category }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    image_url: category.image_url || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', category.id);

      if (error) throw error;

      toast.success('Category updated successfully!');
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)
    ) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', category.id);
      if (error) throw error;

      toast.success('Category deleted successfully!');
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
              <p className="text-gray-600">Update category information</p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  placeholder="Category description..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Category Image (Upload or URL)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://example.com/category-image.jpg"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const { uploadOptimizedImage } = await import('@/lib/image-upload');
                      try {
                        const result = await uploadOptimizedImage(file, {
                          folder: 'categories',
                          generateSizes: false,
                          uploadProvider: 'supabase',
                        });
                        if (result.original.publicUrl) {
                          setFormData((prev) => ({
                            ...prev,
                            image_url: result.original.publicUrl,
                          }));
                          toast.success('Image uploaded!');
                        }
                      } catch (err) {
                        toast.error('Failed to upload image');
                      }
                    }}
                  />
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Category Preview"
                      className="max-h-32 rounded border"
                      style={{ objectFit: 'contain', background: '#f3f4f6' }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
