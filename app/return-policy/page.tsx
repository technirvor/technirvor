import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Package,
  AlertCircle,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "Return Policy - Tech Nirvor",
  description: "Tech Nirvor's Return and Refund Policy. Learn about our return process, eligibility criteria, and refund procedures.",
  keywords: ["return policy", "refund policy", "exchange policy", "tech nirvor returns"],
};

export default function ReturnPolicyPage() {
  const lastUpdated = "১৫ জানুয়ারি, ২০২৪";

  const returnTimeframes = [
    { category: "ইলেকট্রনিক্স ও গ্যাজেট", days: "৭ দিন", condition: "অবিকৃত মূল প্যাকেজিং" },
    { category: "ফ্যাশন ও পোশাক", days: "১৪ দিন", condition: "ট্যাগ সহ অব্যবহৃত" },
    { category: "বই ও মিডিয়া", days: "৩০ দিন", condition: "অক্ষত অবস্থা" },
    { category: "ঘর ও বাগান", days: "১৪ দিন", condition: "অব্যবহৃত অবস্থা" },
    { category: "সৌন্দর্য ও ব্যক্তিগত যত্ন", days: "৭ দিন", condition: "অবিকৃত ও সিল করা" },
    { category: "খেলাধুলা ও আউটডোর", days: "১৪ দিন", condition: "প্যাকেজিং সহ অব্যবহৃত" }
  ];

  const eligibleItems = [
    "Items in original packaging and condition",
    "Products with all accessories and manuals",
    "Items with original tags and labels",
    "Unopened sealed products",
    "Defective or damaged items upon delivery",
    "Items that don't match the description"
  ];

  const nonEligibleItems = [
    "Personalized or customized products",
    "Perishable goods and food items",
    "Intimate or sanitary products",
    "Digital downloads and software",
    "Items damaged by misuse",
    "Products without original packaging",
    "Items returned after the return period"
  ];

  const returnSteps = [
    {
      step: 1,
      title: "Contact Customer Service",
      description: "Call us or send an email with your order number and reason for return.",
      icon: Phone
    },
    {
      step: 2,
      title: "Get Return Authorization",
      description: "We'll provide a Return Authorization Number (RAN) and return instructions.",
      icon: CheckCircle
    },
    {
      step: 3,
      title: "Package the Item",
      description: "Pack the item securely in original packaging with all accessories.",
      icon: Package
    },
    {
      step: 4,
      title: "Ship or Schedule Pickup",
      description: "Send the package to us or schedule a pickup from your location.",
      icon: RotateCcw
    },
    {
      step: 5,
      title: "Processing & Refund",
      description: "We'll inspect the item and process your refund within 5-7 business days.",
      icon: CreditCard
    }
  ];

  const refundMethods = [
    {
      method: "Original Payment Method",
      timeframe: "5-7 business days",
      description: "Refund to the original payment method used for purchase"
    },
    {
      method: "Store Credit",
      timeframe: "Immediate",
      description: "Instant store credit for future purchases"
    },
    {
      method: "Bank Transfer",
      timeframe: "3-5 business days",
      description: "Direct bank transfer for cash on delivery orders"
    },
    {
      method: "Mobile Banking",
      timeframe: "1-2 business days",
      description: "Refund to bKash, Nagad, or other mobile wallets"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ফেরত নীতি
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            আমরা চাই আপনি আপনার ক্রয়ে সম্পূর্ণ সন্তুষ্ট হন। আমাদের ঝামেলামুক্ত ফেরত প্রক্রিয়া সম্পর্কে জানুন।
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              সর্বশেষ আপডেট: {lastUpdated}
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
                  <RotateCcw className="w-6 h-6 text-green-600" />
                  আমাদের ফেরত প্রতিশ্রুতি
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  টেক নির্ভরে, গ্রাহক সন্তুষ্টি আমাদের প্রধান অগ্রাধিকার। আমরা একটি ব্যাপক ফেরত নীতি অফার করি 
                  যাতে আপনি আপনার ক্রয়ে সম্পূর্ণ খুশি হন। যদি আপনি কোনো কারণে সন্তুষ্ট না হন, 
                  আমরা এটি ঠিক করতে সাহায্য করার জন্য এখানে আছি।
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900">৩০ দিন পর্যন্ত</h3>
                    <p className="text-sm text-gray-600">পণ্যের ধরন অনুযায়ী ফেরতের সময় ভিন্ন</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900">বিনামূল্যে ফেরত</h3>
                    <p className="text-sm text-gray-600">ত্রুটিপূর্ণ পণ্যের জন্য কোনো ফেরত শিপিং চার্জ নেই</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900">দ্রুত রিফান্ড</h3>
                    <p className="text-sm text-gray-600">৫-৭ কার্যদিবসের মধ্যে প্রক্রিয়া করা হয়</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return Timeframes */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Return Timeframes by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Product Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Return Period</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Condition Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnTimeframes.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700">{item.category}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              {item.days}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{item.condition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Eligible vs Non-Eligible Items */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Eligible for Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {eligibleItems.map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <XCircle className="w-6 h-6 text-red-600" />
                    Not Eligible for Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {nonEligibleItems.map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Return Process */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  How to Return an Item
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {returnSteps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{step.step}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                          </div>
                          <p className="text-gray-700">{step.description}</p>
                        </div>
                        {index < returnSteps.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Refund Methods */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  Refund Methods and Timeframes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {refundMethods.map((method, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{method.method}</h3>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {method.timeframe}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{method.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Circumstances */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  Special Circumstances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Defective or Damaged Items</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Report within 24 hours of delivery</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Free return shipping and full refund</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Option for immediate replacement</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Wrong Item Delivered</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">We'll arrange immediate pickup and replacement</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">No return shipping charges</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Priority processing for correct item delivery</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Change of Mind</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Standard return period applies</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Item must be in original condition</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">Return shipping may be charged to customer</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Need Help with Returns?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Our customer service team is here to help with your return. Contact us for assistance:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Phone Support</p>
                      <p className="text-gray-600">+880 1410-077761</p>
                      <p className="text-sm text-gray-500">9:00 AM - 10:00 PM (Daily)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email Support</p>
                      <p className="text-gray-600">returns@technirvor.com</p>
                      <p className="text-sm text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                  <p className="text-blue-800 font-medium">
                    <strong>Pro Tip:</strong> Have your order number ready when contacting us for faster service. 
                    You can find your order number in your email confirmation or account dashboard.
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