import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingBag, 
  Truck, 
  Shield, 
  Users, 
  Award, 
  Clock,
  MapPin,
  Target,
  Heart,
  Star
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - Tech Nirvor",
  description: "Learn about Tech Nirvor, Bangladesh's trusted online shopping destination. Our mission, vision, and commitment to providing authentic products with excellent service.",
  keywords: ["about tech nirvor", "company information", "online shopping bangladesh", "ecommerce company"],
};

export default function AboutUsPage() {
  const stats = [
    { icon: Users, label: "Happy Customers", value: "50,000+" },
    { icon: ShoppingBag, label: "Products Sold", value: "100,000+" },
    { icon: Truck, label: "Orders Delivered", value: "75,000+" },
    { icon: Award, label: "Years of Service", value: "5+" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Authenticity",
      description: "We guarantee 100% authentic products from trusted brands and suppliers."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery across Bangladesh with real-time tracking."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our priority with 24/7 customer support."
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Rigorous quality checks ensure you receive the best products."
    }
  ];

  const milestones = [
    {
      year: "2019",
      title: "Company Founded",
      description: "Tech Nirvor was established with a vision to revolutionize online shopping in Bangladesh."
    },
    {
      year: "2020",
      title: "First 1,000 Orders",
      description: "Achieved our first milestone of 1,000 successful orders and happy customers."
    },
    {
      year: "2021",
      title: "Nationwide Delivery",
      description: "Expanded delivery services to cover all 64 districts of Bangladesh."
    },
    {
      year: "2022",
      title: "Mobile App Launch",
      description: "Launched our mobile application for better shopping experience."
    },
    {
      year: "2023",
      title: "50,000+ Customers",
      description: "Reached the milestone of serving over 50,000 satisfied customers."
    },
    {
      year: "2024",
      title: "Premium Services",
      description: "Introduced premium delivery and exclusive product lines."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Tech Nirvor
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Bangladesh's most trusted online shopping destination, committed to bringing 
            you authentic products with exceptional service.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">Proudly serving Bangladesh since 2019</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Our Story
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Tech Nirvor was born from a simple idea: to make quality products accessible 
                  to everyone in Bangladesh through a seamless online shopping experience. 
                  Founded in 2019, we started as a small team with big dreams.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Today, we've grown into one of Bangladesh's most trusted e-commerce platforms, 
                  serving thousands of customers across all 64 districts. Our commitment to 
                  authenticity, quality, and customer satisfaction remains unchanged.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We believe that everyone deserves access to genuine products at fair prices, 
                  delivered with care and backed by excellent customer service.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Our Mission</h3>
                <p className="text-gray-700 mb-6">
                  To revolutionize online shopping in Bangladesh by providing authentic products, 
                  exceptional service, and innovative solutions that exceed customer expectations.
                </p>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Our Vision</h3>
                <p className="text-gray-700">
                  To become Bangladesh's leading e-commerce platform, known for trust, quality, 
                  and customer-centricity, while contributing to the digital transformation of 
                  the country's retail landscape.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Our Journey
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="text-lg px-4 py-2 bg-blue-50 border-blue-200">
                      {milestone.year}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{milestone.title}</h3>
                    <p className="text-gray-700">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Why Choose Tech Nirvor?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <Clock className="w-12 h-12 mx-auto" />
              <h3 className="text-xl font-bold">Fast Delivery</h3>
              <p className="text-blue-100">
                Same-day delivery in Dhaka and 1-3 days nationwide with real-time tracking.
              </p>
            </div>
            <div className="space-y-4">
              <Shield className="w-12 h-12 mx-auto" />
              <h3 className="text-xl font-bold">100% Authentic</h3>
              <p className="text-blue-100">
                All products are sourced directly from authorized dealers and brands.
              </p>
            </div>
            <div className="space-y-4">
              <Heart className="w-12 h-12 mx-auto" />
              <h3 className="text-xl font-bold">Customer Support</h3>
              <p className="text-blue-100">
                24/7 customer service with dedicated support team for all your needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}