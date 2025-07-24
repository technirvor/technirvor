'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Gift, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/lib/cart-store';
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
      sale_price?: number;
    };
  }[];
}

export default function ComboOffersPage() {
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

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
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComboProducts(data || []);
    } catch (error) {
      console.error('Error fetching combo products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = (originalPrice: number, comboPrice: number) => {
    return Math.round(((originalPrice - comboPrice) / originalPrice) * 100);
  };

  const handleAddToCart = (combo: ComboProduct) => {
    // For combo products, we'll add each individual item to cart
    combo.items.forEach((item) => {
      addItem(item.product, item.quantity);
    });
    toast.success(`Added ${combo.name} to cart!`);
  };

  const handleBuyNow = (combo: ComboProduct) => {
    handleAddToCart(combo);
    window.location.href = '/checkout';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Combo Offers</h1>
            </div>
            <p className="text-xl mb-2">Buy more, save more with our exclusive combo deals!</p>
            <p className="text-lg opacity-90">Get multiple products at unbeatable prices</p>
          </div>
        </div>

        {/* Combo Products Grid */}
        {comboProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comboProducts.map((combo) => {
              const savings = calculateSavings(combo.original_price, combo.combo_price);

              return (
                <Card
                  key={combo.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative">
                    <Image
                      src={
                        combo.image_url || combo.items[0]?.product.image_url || '/placeholder.svg'
                      }
                      alt={combo.name}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-600 text-white">
                        <Gift className="w-3 h-3 mr-1" />
                        Combo Deal
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="destructive" className="text-sm font-bold">
                        {savings}% OFF
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{combo.name}</h3>
                      {combo.description && (
                        <p className="text-gray-600 text-sm mb-3">{combo.description}</p>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold text-green-600">
                          ৳{combo.combo_price.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ৳{combo.original_price.toLocaleString()}
                        </span>
                      </div>

                      {/* Combo Items */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">This combo includes:</h4>
                        <div className="space-y-2">
                          {combo.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3">
                              <Image
                                src={item.product.image_url || '/placeholder.svg'}
                                alt={item.product.name}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.quantity}x {item.product.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ৳
                                  {(item.product.sale_price || item.product.price).toLocaleString()}{' '}
                                  each
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Savings Highlight */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">You save:</span>
                          <span className="text-lg font-bold text-green-600">
                            ৳{(combo.original_price - combo.combo_price).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAddToCart(combo)}
                          variant="outline"
                          className="flex-1 bg-transparent"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          onClick={() => handleBuyNow(combo)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Gift className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Combo Offers Available</h2>
            <p className="text-gray-600 mb-6">Check back later for amazing combo deals!</p>
            <Link href="/products">
              <Button>Browse Individual Products</Button>
            </Link>
          </div>
        )}

        {/* Why Choose Combos Section */}
        {comboProducts.length > 0 && (
          <div className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl">Why Choose Our Combo Offers?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <Gift className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Better Value</h3>
                    <p className="text-gray-600">
                      Get more products for less money with our carefully curated combos
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <ShoppingCart className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Convenience</h3>
                    <p className="text-gray-600">
                      Everything you need in one package - no need to shop separately
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                      <Star className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assured</h3>
                    <p className="text-gray-600">
                      All combo products are hand-picked for quality and compatibility
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
