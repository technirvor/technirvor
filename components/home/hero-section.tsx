"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Smartphone, Laptop, Headphones, Camera, Watch, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  { name: "Mobile", icon: Smartphone, href: "/categories/mobile" },
  { name: "Laptop", icon: Laptop, href: "/categories/laptop" },
  { name: "Audio", icon: Headphones, href: "/categories/audio" },
  { name: "Camera", icon: Camera, href: "/categories/camera" },
  { name: "Watch", icon: Watch, href: "/categories/watch" },
  { name: "Gaming", icon: Gamepad2, href: "/categories/gaming" },
]

const slides = [
  {
    id: 1,
    title: "Latest iPhone 15 Pro Max",
    subtitle: "Now Available in Bangladesh",
    description: "Experience the power of A17 Pro chip with titanium design",
    image: "/placeholder.svg?height=400&width=600",
    buttonText: "Shop Now",
    buttonLink: "/products/iphone-15-pro-max",
    bgColor: "bg-gradient-to-r from-blue-600 to-purple-600",
  },
  {
    id: 2,
    title: "Gaming Laptops Sale",
    subtitle: "Up to 30% Off",
    description: "High-performance gaming laptops for serious gamers",
    image: "/placeholder.svg?height=400&width=600",
    buttonText: "View Deals",
    buttonLink: "/categories/gaming-laptops",
    bgColor: "bg-gradient-to-r from-red-600 to-orange-600",
  },
  {
    id: 3,
    title: "Wireless Earbuds",
    subtitle: "Premium Sound Quality",
    description: "Noise cancellation and crystal clear audio",
    image: "/placeholder.svg?height=400&width=600",
    buttonText: "Explore",
    buttonLink: "/categories/audio",
    bgColor: "bg-gradient-to-r from-green-600 to-teal-600",
  },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative w-full">
    {/* Hero Slider */}
      <div className="lg:col-span-3">

        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`relative h-64 md:h-80 lg:h-96 overflow-hidden max-w-7xl mx-auto ${
              index === currentSlide ? "block" : "hidden"
            }`}
          >
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              style={{ objectFit: "cover" }}
              priority
              className="z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10 flex items-center justify-center md:justify-start px-4 md:px-8">
              <div className="max-w-md text-center md:text-left text-white space-y-4">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">{slide.title}</h2>
                <p className="text-lg md:text-xl font-medium">{slide.subtitle}</p>
                <p className="text-sm md:text-base opacity-90">{slide.description}</p>
                <Link href={slide.buttonLink}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-secondary">
                    {slide.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
            {/* Navigation Buttons on Banner */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/30 rounded-full p-2 transition-colors z-20"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/30 rounded-full p-2 transition-colors z-20"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        ))}

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
