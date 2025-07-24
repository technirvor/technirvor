'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './product-card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface InfiniteProductsProps {
  initialProducts: Product[];
  hasMore: boolean;
  onLoadMore: (offset: number) => Promise<{ products: Product[]; hasMore: boolean }>;
}

export default function InfiniteProducts({
  initialProducts,
  hasMore: initialHasMore,
  onLoadMore,
}: InfiniteProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const result = await onLoadMore(products.length);
      setProducts((prev) => [...prev, ...result.products]);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, products.length, onLoadMore]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading more products...</span>
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <Button onClick={loadMore} size="lg">
              Load More Products
            </Button>
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            You've reached the end of our products!
          </div>
        )}
      </div>
    </section>
  );
}
