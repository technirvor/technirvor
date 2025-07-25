"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

interface CategoryScrollProps {
  categories: Category[];
}

export default function CategoryScroll({ categories }: CategoryScrollProps) {
  if (categories.length === 0) return null;

  // Duplicate categories for seamless scrolling
  const duplicatedCategories = [...categories, ...categories];

  return (
    <div className="py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Shop by Category
        </h2>
        <div
          className="flex space-x-4 overflow-x-auto"
          style={{
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <div className="flex animate-scroll hover:pause">
            {duplicatedCategories.map((category, index) => (
              <Link
                key={`${category.id}-${index}`}
                href={`/category/${category.slug}`}
                className="flex-shrink-0 group flex flex-col items-center mx-4"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-md group-hover:shadow-lg transition-shadow">
                  {category.image_url ? (
                    <Image
                      src={category.image_url || "/placeholder.svg"}
                      alt={category.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="w-20 md:w-24 text-center text-sm font-medium text-gray-900 mt-2 group-hover:text-blue-600">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
