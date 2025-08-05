"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
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
                alt="টেক নির্ভর"
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-logo.png";
                }}
              />
              <span className="text-xl font-bold">টেক নির্ভর</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              বাংলাদেশে আপনার বিশ্বস্ত অনলাইন শপিং গন্তব্য। আমরা দ্রুত ডেলিভারি,
              ক্যাশ অন ডেলিভারি এবং চমৎকার গ্রাহক সেবা সহ খাঁটি পণ্য অফার করি।
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
            <h3 className="text-lg font-semibold">দ্রুত লিংক</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  হোম
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  সকল পণ্য
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  ক্যাটেগরি
                </Link>
              </li>
              <li>
                <Link
                  href="/combo-offers"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  কম্বো অফার
                </Link>
              </li>
              <li>
                <Link
                  href="/flash-sale"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  ফ্ল্যাশ সেল
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  অর্ডার ট্র্যাক
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Pages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">তথ্য</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about-us"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  যোগাযোগ করুন
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  গোপনীয়তা নীতি
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  শর্তাবলী
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  ফেরত নীতি
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  শিপিং নীতি
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">যোগাযোগের তথ্য</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>১২৩ কমার্স স্ট্রিট</p>
                  <p>ঢাকা ১০০০, বাংলাদেশ</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>+৮৮০ ১৪১০-০৭৭৭৬১</p>
                  <p>+৮৮০ ১৭১০-১২৩৪৫৬</p>
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
                  <p>গ্রাহক সেবা:</p>
                  <p>সকাল ৯:০০ - রাত ১০:০০</p>
                  <p>সপ্তাহে ৭ দিন</p>
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
            © {currentYear} টেক নির্ভর। সকল অধিকার সংরক্ষিত।
          </div>
          <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
            <span>নিরাপদ পেমেন্ট</span>
            <span>•</span>
            <span>ক্যাশ অন ডেলিভারি</span>
            <span>•</span>
            <span>দ্রুত ডেলিভারি</span>
            <span>•</span>
            <span>খাঁটি পণ্য</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
