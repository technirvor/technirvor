'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ComboProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  combo_price: number;
  original_price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  items: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      image_url: string;
      price: number;
    };
  }[];
}

export default function AdminComboProductsPage() {
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComboProducts();
  }, []);

  const fetchComboProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('combo_products')
        .select(
          `
          *,
          items:combo_product_items(
            *,
            product:products(*)
          )
        `,
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComboProducts(data || []);
    } catch (error) {
      console.error('Error fetching combo products:', error);
      toast.error('Failed to fetch combo products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase.from('combo_products').delete().eq('id', id);
      if (error) throw error;

      setComboProducts(comboProducts.filter((c) => c.id !== id));
      toast.success('Combo product deleted successfully');
    } catch (error) {
      console.error('Error deleting combo product:', error);
      toast.error('Failed to delete combo product');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('combo_products')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setComboProducts(
        comboProducts.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c)),
      );
      toast.success(`Combo product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating combo product:', error);
      toast.error('Failed to update combo product');
    }
  };

  const calculateSavings = (originalPrice: number, comboPrice: number) => {
    return Math.round(((originalPrice - comboPrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Combo Products Management</h1>
          <Link href="/admin/combo-products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Combo
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Combo Products ({comboProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Original Price</TableHead>
                    <TableHead>Combo Price</TableHead>
                    <TableHead>Savings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comboProducts.map((combo) => (
                    <TableRow key={combo.id}>
                      <TableCell>
                        <Image
                          src={combo.image_url || '/placeholder.svg'}
                          alt={combo.name}
                          width={50}
                          height={50}
                          className="rounded-lg object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{combo.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {combo.items?.slice(0, 2).map((item) => (
                            <div key={item.id} className="text-sm text-gray-600">
                              {item.quantity}x {item.product.name}
                            </div>
                          ))}
                          {combo.items?.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{combo.items.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 line-through">
                        ৳{combo.original_price.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ৳{combo.combo_price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {calculateSavings(combo.original_price, combo.combo_price)}% OFF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={combo.is_active ? 'default' : 'secondary'}>
                          {combo.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/combo/${combo.slug}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/combo-products/${combo.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(combo.id, combo.is_active)}
                            className={combo.is_active ? 'text-orange-600' : 'text-green-600'}
                          >
                            {combo.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(combo.id, combo.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
