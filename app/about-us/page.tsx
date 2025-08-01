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
    { icon: Users, label: "সন্তুষ্ট গ্রাহক", value: "৫০,০০০+" },
    { icon: ShoppingBag, label: "বিক্রিত পণ্য", value: "১,০০,০০০+" },
    { icon: Truck, label: "ডেলিভারি সম্পন্ন", value: "৭৫,০০০+" },
    { icon: Award, label: "সেবার বছর", value: "৫+" },
  ];

  const values = [
    {
      icon: Shield,
      title: "সত্যতা",
      description: "আমরা বিশ্বস্ত ব্র্যান্ড এবং সরবরাহকারীদের কাছ থেকে ১০০% খাঁটি পণ্যের গ্যারান্টি দিই।"
    },
    {
      icon: Truck,
      title: "দ্রুত ডেলিভারি",
      description: "রিয়েল-টাইম ট্র্যাকিং সহ বাংলাদেশ জুড়ে দ্রুত এবং নির্ভরযোগ্য ডেলিভারি।"
    },
    {
      icon: Heart,
      title: "গ্রাহক প্রথম",
      description: "২৪/৭ গ্রাহক সহায়তা সহ আপনার সন্তুষ্টি আমাদের অগ্রাধিকার।"
    },
    {
      icon: Star,
      title: "মান নিশ্চয়তা",
      description: "কঠোর মান পরীক্ষা নিশ্চিত করে যে আপনি সেরা পণ্য পান।"
    }
  ];

  const milestones = [
    {
      year: "২০২৫",
      title: "কোম্পানি প্রতিষ্ঠা",
      description: "বাংলাদেশে অনলাইন শপিংয়ে বিপ্লব আনার দৃষ্টিভঙ্গি নিয়ে টেক নির্ভর প্রতিষ্ঠিত হয়।"
    },
    {
      year: "২০২৫",
      title: "প্রথম ১,০০০ অর্ডার",
      description: "১,০০০ সফল অর্ডার এবং সন্তুষ্ট গ্রাহকের প্রথম মাইলফলক অর্জন।"
    },
    {
      year: "২০২৫",
      title: "দেশব্যাপী ডেলিভারি",
      description: "বাংলাদেশের সব ৬৪টি জেলায় ডেলিভারি সেবা সম্প্রসারণ।"
    },
    {
      year: "২০২৫",
      title: "মোবাইল অ্যাপ চালু",
      description: "উন্নত শপিং অভিজ্ঞতার জন্য আমাদের মোবাইল অ্যাপ্লিকেশন চালু।"
    },
    {
      year: "২০২৫",
      title: "৫০,০০০+ গ্রাহক",
      description: "৫০,০০০ এর বেশি সন্তুষ্ট গ্রাহকদের সেবা প্রদানের মাইলফলক অর্জন।"
    },
    {
      year: "২০২৫",
      title: "প্রিমিয়াম সেবা",
      description: "প্রিমিয়াম ডেলিভারি এবং এক্সক্লুসিভ পণ্যের লাইন চালু।"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            টেক নির্ভর সম্পর্কে
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শপিং গন্তব্য, ব্যতিক্রমী সেবার সাথে 
            আপনার কাছে খাঁটি পণ্য পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
          </p>
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">২০২৫ সাল থেকে গর্বের সাথে বাংলাদেশে সেবা প্রদান</span>
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
              আমাদের গল্প
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  টেক নির্ভর একটি সহজ ধারণা থেকে জন্ম নিয়েছে: একটি নিরবচ্ছিন্ন অনলাইন শপিং অভিজ্ঞতার 
                  মাধ্যমে বাংলাদেশের সবার কাছে মানসম্পন্ন পণ্য পৌঁছে দেওয়া। ২০২৫ সালে প্রতিষ্ঠিত, 
                  আমরা বড় স্বপ্ন নিয়ে একটি ছোট দল হিসেবে শুরু করেছিলাম।
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  আজ, আমরা বাংলাদেশের সবচেয়ে বিশ্বস্ত ই-কমার্স প্ল্যাটফর্মগুলির মধ্যে একটিতে 
                  পরিণত হয়েছি, সব ৬৪টি জেলায় হাজার হাজার গ্রাহকদের সেবা প্রদান করছি। সত্যতা, 
                  মান এবং গ্রাহক সন্তুষ্টির প্রতি আমাদের অঙ্গীকার অপরিবর্তিত রয়েছে।
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  আমরা বিশ্বাস করি যে সবাই ন্যায্য মূল্যে খাঁটি পণ্যের অ্যাক্সেস পাওয়ার যোগ্য, 
                  যত্নের সাথে ডেলিভারি এবং চমৎকার গ্রাহক সেবার সমর্থনে।
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">আমাদের লক্ষ্য</h3>
                <p className="text-gray-700 mb-6">
                  খাঁটি পণ্য, ব্যতিক্রমী সেবা এবং গ্রাহকের প্রত্যাশা ছাড়িয়ে যাওয়া উদ্ভাবনী 
                  সমাধান প্রদানের মাধ্যমে বাংলাদেশে অনলাইন শপিংয়ে বিপ্লব আনা।
                </p>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">আমাদের দৃষ্টিভঙ্গি</h3>
                <p className="text-gray-700">
                  বিশ্বাস, মান এবং গ্রাহক-কেন্দ্রিকতার জন্য পরিচিত বাংলাদেশের শীর্ষস্থানীয় 
                  ই-কমার্স প্ল্যাটফর্ম হয়ে ওঠা, পাশাপাশি দেশের খুচরা ব্যবসার ডিজিটাল 
                  রূপান্তরে অবদান রাখা।
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
            আমাদের মূল্যবোধ
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
            আমাদের যাত্রা
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
            কেন টেক নির্ভর বেছে নেবেন?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <Clock className="w-12 h-12 mx-auto" />
              <h3 className="text-xl font-bold">দ্রুত ডেলিভারি</h3>
              <p className="text-blue-100">
                ঢাকায় একই দিনে এবং দেশব্যাপী ১-৩ দিনে রিয়েল-টাইম ট্র্যাকিং সহ ডেলিভারি।
              </p>
            </div>
            <div className="space-y-4">
              <Shield className="w-12 h-12 mx-auto" />
              <h3 className="text-xl font-bold">১০০% খাঁটি</h3>
              <p className="text-blue-100">
                সব পণ্য সরাসরি অনুমোদিত ডিলার এবং ব্র্যান্ড থেকে সংগ্রহ করা হয়।
              </p>
            </div>
            <div className="space-y-4">
              <Heart className="w-12 h-12 mx-auto" />
              <h3 className="text-xl font-bold">গ্রাহক সহায়তা</h3>
              <p className="text-blue-100">
                আপনার সব প্রয়োজনের জন্য নিবেদিত সহায়তা দল সহ ২৪/৭ গ্রাহক সেবা।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}