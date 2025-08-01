"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo/logo-white.png" 
                alt="Tech Nirvor" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-logo.png";
                }}
              />
              <span className="text-xl font-bold">Tech Nirvor</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted online shopping destination in Bangladesh. We offer authentic products 
              with fast delivery, cash on delivery, and excellent customer service.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://facebook.com/technirvor" 
                target="_blank"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link 
                href="https://twitter.com/technirvor" 
                target="_blank"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link 
                href="https://instagram.com/technirvor" 
                target="_blank"
                className="text-gray-400 hover:text-pink-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link 
                href="https://youtube.com/@technirvor" 
                target="_blank"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/combo-offers" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Combo Offers
                </Link>
              </li>
              <li>
                <Link href="/flash-sale" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Flash Sale
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Pages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about-us" className="text-gray-300 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>123 Commerce Street</p>
                  <p>Dhaka 1000, Bangladesh</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>+880 1410-077761</p>
                  <p>+880 1710-123456</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>support@technirvor.com</p>
                  <p>info@technirvor.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>Customer Service:</p>
                  <p>9:00 AM - 10:00 PM</p>
                  <p>7 Days a Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © {currentYear} Tech Nirvor. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
            <span>Secure Payment</span>
            <span>•</span>
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>Fast Delivery</span>
            <span>•</span>
            <span>Authentic Products</span>
          </div>
        </div>
      </div>
    </footer>
  );
}