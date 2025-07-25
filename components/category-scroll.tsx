"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

interface CategoryScrollProps {
  categories: Category[];
}

export default function CategoryScroll({ categories }: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || categories.length === 0) return;

    // Only auto-scroll on desktop devices
    const isTouchDevice = () => {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    };

    if (isTouchDevice()) {
      // On mobile/touch, let user scroll natively
      return;
    }

    let animationFrameId: number;
    const scrollStep = 1;
    let paused = false;

    const scroll = () => {
      if (!scrollContainer || paused) {
        animationFrameId = window.requestAnimationFrame(scroll);
        return;
      }
      // True infinite scroll: when reaching the end, jump back by half the scrollWidth (length of one set)
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft -= scrollContainer.scrollWidth / 2;
      } else {
        scrollContainer.scrollLeft += scrollStep;
      }
      animationFrameId = window.requestAnimationFrame(scroll);
    };

    const handleMouseEnter = () => {
      paused = true;
    };
    const handleMouseLeave = () => {
      paused = false;
    };
    const handleFocusIn = () => {
      paused = true;
    };
    const handleFocusOut = () => {
      paused = false;
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);
    scrollContainer.addEventListener("focusin", handleFocusIn);
    scrollContainer.addEventListener("focusout", handleFocusOut);

    animationFrameId = window.requestAnimationFrame(scroll);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      scrollContainer.removeEventListener("focusin", handleFocusIn);
      scrollContainer.removeEventListener("focusout", handleFocusOut);
    };
  }, [categories.length]);

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
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto touch-pan-x"
          style={{
            scrollBehavior: "auto",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none", // IE and Edge
            scrollbarWidth: "none", // Firefox
          }}
          tabIndex={0}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {duplicatedCategories.map((category, index) => (
            <Link
              key={`${category.id}-${index}`}
              href={`/category/${category.slug}`}
              className="flex-shrink-0 group"
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
              <p className="text-center text-sm font-medium text-gray-900 mt-2 group-hover:text-blue-600">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
