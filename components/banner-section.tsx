import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BannerSection() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Flash Sale Banner */}
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Flash Sale
              </h3>
              <p className="text-lg mb-4">Up to 70% off on selected items</p>
              <p className="text-sm mb-4">Limited time offer - Hurry up!</p>
              <Link href="/flash-sale">
                <Button variant="secondary" size="lg">
                  Shop Flash Sale
                </Button>
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mb-10"></div>
          </div>

          {/* Combo Offer Banner */}
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Combo Offers
              </h3>
              <p className="text-lg mb-4">Buy more, save more!</p>
              <p className="text-sm mb-4">Special combo deals available</p>
              <Link href="/combo-offers">
                <Button variant="secondary" size="lg">
                  View Combos
                </Button>
              </Link>
            </div>
            <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
