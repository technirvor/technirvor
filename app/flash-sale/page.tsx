'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import ProductCard from '@/components/product-card';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export default function FlashSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    fetchFlashSaleProducts();

    // Update countdown every second
    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchFlashSaleProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .eq('is_flash_sale', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching flash sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    // Set flash sale end time (example: 24 hours from now)
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999); // End of today

    const now = new Date().getTime();
    const distance = endTime.getTime() - now;

    if (distance > 0) {
      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
        {/* Flash Sale Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">⚡ Flash Sale ⚡</h1>
            <p className="text-xl mb-6">Limited time offers - Up to 70% off!</p>

            {/* Countdown Timer */}
            <div className="flex justify-center items-center space-x-4 mb-4">
              <Clock className="w-6 h-6" />
              <span className="text-lg font-semibold">Ends in:</span>
              <div className="flex space-x-2">
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <div className="text-2xl font-bold">
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs">Hours</div>
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <div className="text-2xl font-bold">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs">Minutes</div>
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <div className="text-2xl font-bold">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flash Sale Products */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Flash Sale Products</h2>
            <p className="text-gray-600 mb-6">Check back later for amazing deals!</p>
          </div>
        )}
      </div>
    </div>
  );
}
