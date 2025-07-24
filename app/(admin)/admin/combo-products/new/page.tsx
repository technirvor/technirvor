'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';

interface ComboItem {
  productId: string;
  product: Product;
  quantity: number;
}

export default function NewComboProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    comboPrice: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('name');
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const addComboItem = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = comboItems.find((item) => item.productId === productId);
    if (existingItem) {
      setComboItems(
        comboItems.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      setComboItems([...comboItems, { productId, product, quantity: 1 }]);
    }
  };

  const updateComboItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeComboItem(productId);
      return;
    }
    setComboItems(
      comboItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  };

  const removeComboItem = (productId: string) => {
    setComboItems(comboItems.filter((item) => item.productId !== productId));
  };

  const calculateOriginalPrice = () => {
    return comboItems.reduce((total, item) => {
      const price = item.product.sale_price || item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const calculateSavings = () => {
    const originalPrice = calculateOriginalPrice();
    const comboPrice = Number.parseFloat(formData.comboPrice) || 0;
    if (originalPrice === 0) return 0;
    return Math.round(((originalPrice - comboPrice) / originalPrice) * 100);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Combo name is required');
      return false;
    }
    if (comboItems.length < 2) {
      toast.error('At least 2 products are required for a combo');
      return false;
    }
    if (!formData.comboPrice || Number.parseFloat(formData.comboPrice) <= 0) {
      toast.error('Valid combo price is required');
      return false;
    }
    if (Number.parseFloat(formData.comboPrice) >= calculateOriginalPrice()) {
      toast.error('Combo price must be less than original price');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create combo product
      const { data: combo, error: comboError } = await supabase
        .from('combo_products')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          combo_price: Number.parseFloat(formData.comboPrice),
          original_price: calculateOriginalPrice(),
          image_url: formData.imageUrl || comboItems[0]?.product.image_url,
        })
        .select()
        .single();

      if (comboError) throw comboError;

      // Create combo items
      const comboItemsData = comboItems.map((item) => ({
        combo_id: combo.id,
        product_id: item.productId,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('combo_product_items')
        .insert(comboItemsData);

      if (itemsError) throw itemsError;

      toast.success('Combo product created successfully!');
      router.push('/admin/combo-products');
    } catch (error) {
      console.error('Error creating combo product:', error);
      toast.error('Failed to create combo product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Combo Product</h1>
          <p className="text-gray-600 mt-2">
            Bundle multiple products together at a discounted price
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Combo Form */}
          <Card>
            <CardHeader>
              <CardTitle>Combo Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Combo Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter combo name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="combo-slug"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your combo offer"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Combo Image (Upload or URL)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="https://example.com/combo-image.jpg"
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
                            folder: 'combo-products',
                            generateSizes: false,
                            uploadProvider: 'supabase',
                          });
                          if (result.original.publicUrl) {
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: result.original.publicUrl,
                            }));
                            toast.success('Image uploaded!');
                          }
                        } catch (err) {
                          toast.error('Failed to upload image');
                        }
                      }}
                    />
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <Image
                        src={formData.imageUrl}
                        alt="Combo Preview"
                        width={80}
                        height={80}
                        className="rounded border object-cover"
                        style={{ background: '#f3f4f6' }}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to use first product's image
                  </p>
                </div>

                <div>
                  <Label htmlFor="comboPrice">Combo Price (৳) *</Label>
                  <Input
                    id="comboPrice"
                    type="number"
                    step="0.01"
                    value={formData.comboPrice}
                    onChange={(e) => handleInputChange('comboPrice', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Pricing Summary */}
                {comboItems.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Pricing Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Original Price:</span>
                        <span className="line-through text-gray-500">
                          ৳{calculateOriginalPrice().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Combo Price:</span>
                        <span className="font-semibold text-green-600">
                          ৳{(Number.parseFloat(formData.comboPrice) || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Savings:</span>
                        <span className="text-green-600">{calculateSavings()}% OFF</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Combo'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <div className="space-y-6">
            {/* Add Products */}
            <Card>
              <CardHeader>
                <CardTitle>Add Products to Combo</CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={addComboItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter(
                        (product) => !comboItems.some((item) => item.productId === product.id),
                      )
                      .map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ৳{(product.sale_price || product.price).toLocaleString()}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Selected Products */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Products ({comboItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comboItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <Image
                        src={item.product.image_url || '/placeholder.svg'}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          ৳{(item.product.sale_price || item.product.price).toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateComboItemQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateComboItemQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeComboItem(item.productId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {comboItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No products selected yet</p>
                      <p className="text-sm">Add products from the dropdown above</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
