'use client';

import type { Product } from '@/lib/types';
import ProductCard from './product-card';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <a href="/products" className="text-blue-600 hover:text-blue-800 font-medium">
            View All
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.slice(0, 10).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              className={`${index >= 4 ? 'hidden md:block' : ''} ${index >= 10 ? 'hidden xl:block' : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
