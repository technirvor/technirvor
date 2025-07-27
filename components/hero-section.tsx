"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/lib/types";

interface HeroSectionProps {
  slides: HeroSlide[];
}

export default function HeroSection({ slides }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative h-[60vh] max-h-[400px] md:h-96 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
            Welcome to Our Store
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6">
            Discover amazing products at great prices
          </p>
          <Button size="lg" variant="secondary">
            Shop Now
          </Button>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[60vh] max-h-[400px] md:h-96 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide
              ? "translate-x-0"
              : index < currentSlide
                ? "-translate-x-full"
                : "translate-x-full"
          }`}
        >
          <Image
            src={slide.image_url || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
            <div className="text-center text-white px-4 max-w-xs sm:max-w-md md:max-w-2xl">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-base sm:text-lg md:text-xl mb-4">
                  {slide.subtitle}
                </p>
              )}
              {slide.link_url && (
                <Link href={slide.link_url}>
                  <Button size="lg" variant="secondary" className="text-sm sm:text-base">
                    Shop Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 sm:left-4"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 sm:right-4"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
