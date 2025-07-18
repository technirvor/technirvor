import Link from "next/link"
import { Package } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-card py-8">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Image src="/logo/logo-white.png" alt="Tech Nirvor" width={240} height={40} />
          </Link>
          <p className="text-sm text-muted-foreground">
            Fuelling Your Digital Life, Without Breaking the Bank. Discover the latest electronics, gadgets, and
            accessories at unbeatable prices.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:underline">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:underline">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:underline">
                Track Order
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Customer Service</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <Link href="#" className="hover:underline">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Contact Info</h3>
          <p className="text-sm text-muted-foreground">
            Roupnagar #D53, Mirpur, Dhaka, Bangladesh
            <br />
            Email: info@technirvor.com
            <br />
            Phone: +880 1410 077761
          </p>
        </div>
      </div>
      <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Tech Nirvor. All rights reserved.
      </div>
    </footer>
  )
}
