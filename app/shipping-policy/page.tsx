import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  Clock, 
  MapPin, 
  Package, 
  CreditCard, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Plane,
  Home
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy - Tech Nirvor",
  description: "Tech Nirvor's Shipping Policy. Learn about delivery times, shipping costs, and delivery options across Bangladesh.",
  keywords: ["shipping policy", "delivery policy", "shipping costs", "delivery times", "tech nirvor shipping"],
};

export default function ShippingPolicyPage() {
  const lastUpdated = "January 15, 2024";

  const shippingZones = [
    {
      zone: "Dhaka City",
      areas: ["Dhaka Metropolitan Area", "Gulshan", "Dhanmondi", "Uttara", "Mirpur"],
      deliveryTime: "Same Day / Next Day",
      cost: "৳60 - ৳100",
      freeThreshold: "৳1,500"
    },
    {
      zone: "Dhaka Division",
      areas: ["Gazipur", "Narayanganj", "Manikganj", "Munshiganj", "Faridpur"],
      deliveryTime: "1-2 Days",
      cost: "৳100 - ৳150",
      freeThreshold: "৳2,000"
    },
    {
      zone: "Major Cities",
      areas: ["Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur"],
      deliveryTime: "2-3 Days",
      cost: "৳150 - ৳200",
      freeThreshold: "৳2,500"
    },
    {
      zone: "Other Districts",
      areas: ["All other 64 districts", "Sub-districts", "Remote areas"],
      deliveryTime: "3-5 Days",
      cost: "৳200 - ৳300",
      freeThreshold: "৳3,000"
    }
  ];

  const deliveryOptions = [
    {
      type: "Standard Delivery",
      icon: Truck,
      description: "Regular delivery during business hours",
      timeframe: "As per zone timing",
      cost: "Standard rates apply",
      features: ["SMS tracking", "Call before delivery", "2 delivery attempts"]
    },
    {
      type: "Express Delivery",
      icon: Plane,
      description: "Faster delivery for urgent orders",
      timeframe: "50% faster than standard",
      cost: "Additional ৳100-200",
      features: ["Priority processing", "Real-time tracking", "Dedicated support"]
    },
    {
      type: "Same Day Delivery",
      icon: Clock,
      description: "Same day delivery within Dhaka",
      timeframe: "Within 6-8 hours",
      cost: "Additional ৳200-300",
      features: ["Order before 2 PM", "Live tracking", "Direct contact with rider"]
    },
    {
      type: "Scheduled Delivery",
      icon: Home,
      description: "Choose your preferred delivery time",
      timeframe: "As per your schedule",
      cost: "Additional ৳50-100",
      features: ["Time slot selection", "Advance notification", "Flexible rescheduling"]
    }
  ];

  const packagingInfo = [
    {
      title: "Secure Packaging",
      description: "All items are carefully packed with protective materials",
      features: ["Bubble wrap for fragile items", "Waterproof packaging", "Tamper-evident sealing"]
    },
    {
      title: "Eco-Friendly Materials",
      description: "We use recyclable and biodegradable packaging materials",
      features: ["Recycled cardboard boxes", "Biodegradable packing peanuts", "Minimal plastic usage"]
    },
    {
      title: "Product Protection",
      description: "Special care for different product categories",
      features: ["Electronics in anti-static bags", "Books in moisture-proof covers", "Clothing in protective sleeves"]
    }
  ];

  const trackingSteps = [
    { status: "Order Confirmed", description: "Your order has been received and confirmed" },
    { status: "Processing", description: "We're preparing your order for shipment" },
    { status: "Packed", description: "Your order has been packed and ready for pickup" },
    { status: "In Transit", description: "Your order is on the way to your location" },
    { status: "Out for Delivery", description: "Your order is out for delivery today" },
    { status: "Delivered", description: "Your order has been successfully delivered" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Shipping Policy
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Fast, reliable delivery across Bangladesh. Learn about our shipping options and delivery process.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Last Updated: {lastUpdated}
            </Badge>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-blue-600" />
                  Our Shipping Promise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  We're committed to delivering your orders quickly and safely across Bangladesh. 
                  Our shipping network covers all 64 districts with various delivery options to suit your needs.
                </p>
                <div className="grid md:grid-cols-4 gap-6 mt-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900">Nationwide</h3>
                    <p className="text-sm text-gray-600">All 64 districts covered</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900">Same Day</h3>
                    <p className="text-sm text-gray-600">Available in Dhaka</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900">Free Shipping</h3>
                    <p className="text-sm text-gray-600">On orders above threshold</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900">Secure</h3>
                    <p className="text-sm text-gray-600">Safe & protected delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Zones */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Shipping Zones and Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Zone</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Coverage Areas</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Delivery Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Shipping Cost</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Free Shipping</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shippingZones.map((zone, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{zone.zone}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600">
                              {zone.areas.slice(0, 2).join(", ")}
                              {zone.areas.length > 2 && (
                                <span className="text-gray-500"> +{zone.areas.length - 2} more</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              {zone.deliveryTime}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-gray-700">{zone.cost}</td>
                          <td className="py-4 px-4">
                            <span className="text-blue-600 font-medium">{zone.freeThreshold}+</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Options */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-green-600" />
                  Delivery Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {deliveryOptions.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                      <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{option.type}</h3>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Timeframe:</span>
                            <span className="font-medium text-gray-900">{option.timeframe}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost:</span>
                            <span className="font-medium text-gray-900">{option.cost}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                          <ul className="space-y-1">
                            {option.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Tracking */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                  Order Tracking Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  Track your order every step of the way with our real-time tracking system. 
                  You'll receive SMS and email updates at each stage.
                </p>
                <div className="space-y-4">
                  {trackingSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{step.status}</h4>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className="w-px h-8 bg-gray-300 ml-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Packaging Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  Packaging and Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {packagingInfo.map((info, index) => (
                    <div key={index} className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                      <p className="text-gray-600 mb-4">{info.description}</p>
                      <ul className="space-y-2">
                        {info.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  Important Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Valid phone number required for delivery coordination</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Complete and accurate delivery address must be provided</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Someone must be available to receive the delivery</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Delays</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Weather conditions may cause delays during monsoon season</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">National holidays and strikes may affect delivery schedules</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Remote areas may require additional delivery time</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cash on Delivery</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Exact amount should be ready for cash on delivery orders</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Delivery person will provide receipt upon payment</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Additional COD charges may apply for certain areas</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact for Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Shipping Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Have questions about shipping or need to track your order? Our shipping support team is here to help:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Phone:</strong> +880 1410-077761</p>
                  <p><strong>Email:</strong> shipping@technirvor.com</p>
                  <p><strong>Track Order:</strong> Visit our Track Order page</p>
                  <p><strong>Support Hours:</strong> 9:00 AM - 10:00 PM (Daily)</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    <strong>Quick Tip:</strong> Save our tracking SMS for easy order monitoring. 
                    You can also track your order anytime from your account dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}