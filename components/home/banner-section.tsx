import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BannerSection() {
  return (
    <section className="w-full py-12">
      <div className="container grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="relative h-[250px] overflow-hidden rounded-lg md:h-[350px] lg:h-[400px]">
          <Image
            src="/placeholder.svg?height=400&width=600&text=Big+Sale+Banner"
            alt="Sale Banner"
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center text-white">
            <h3 className="text-2xl font-bold md:text-3xl">Summer Sale!</h3>
            <p className="mt-2 text-lg md:text-xl">Up to 50% off on selected items.</p>
            <Link href="/products?sale=true" className="mt-4">
              <Button variant="secondary">Shop Sale</Button>
            </Link>
          </div>
        </div>
        <div className="relative h-[250px] overflow-hidden rounded-lg md:h-[350px] lg:h-[400px]">
          <Image
            src="/placeholder.svg?height=400&width=600&text=New+Arrivals+Banner"
            alt="New Arrivals Banner"
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center text-white">
            <h3 className="text-2xl font-bold md:text-3xl">New Arrivals</h3>
            <p className="mt-2 text-lg md:text-xl">Check out our latest collection.</p>
            <Link href="/products?new=true" className="mt-4">
              <Button variant="secondary">Discover Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
