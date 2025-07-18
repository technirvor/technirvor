"use client"
import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function CategoryScrollClient({ categories }: { categories: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let direction: 'right' | 'left' = 'right'
    const scrollStep = 2 // px per frame
    const scrollDelay = 16 // ms per frame (about 60fps)
    let animationFrame: number | null = null

    const animateScroll = () => {
      if (!el) return
      if (direction === 'right') {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
          direction = 'left'
        } else {
          el.scrollLeft += scrollStep
        }
      } else {
        if (el.scrollLeft <= 0) {
          direction = 'right'
        } else {
          el.scrollLeft -= scrollStep
        }
      }
      animationFrame = window.setTimeout(animateScroll, scrollDelay)
    }
    animateScroll()

    return () => {
      if (animationFrame) window.clearTimeout(animationFrame)
    }
  }, [categories])

  return (
    <section className="w-full py-12">
      <div className="container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="flex overflow-x-auto pb-4 hide-scrollbar" ref={scrollRef}>
          <div className="flex gap-4 min-w-max">
            {!categories || !Array.isArray(categories) || categories.length === 0 ? (
              <p className="text-muted-foreground px-4">No categories found.</p>
            ) : (
              categories.map(
                (
                  category: string | { name?: string; slug?: string; image?: string },
                  index: number
                ) => {
                  const name = typeof category === "string" ? category : category?.name || "Unknown"
                  const slug =
                    typeof category === "string"
                      ? category.toLowerCase().replace(/\s+/g, "-")
                      : category?.slug || name.toLowerCase().replace(/\s+/g, "-")

                  return (
                    <Link href={`/categories/${slug}`} key={slug || index}>
                      <Card className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow">
                        <CardContent className="flex flex-col items-center justify-center p-4">
                          <Image
                            src={
                              typeof category === "object" && category?.image
                                ? category.image
                                : `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(
                                    name.split(" ")[0]
                                  )}`
                            }
                            alt={name}
                            width={64}
                            height={64}
                            className="mb-2 rounded-full object-cover"
                          />
                          <p className="text-sm font-medium">{name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                }
              )
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
