import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Shield, 
  AlertTriangle,
  Scale,
  UserX,
  Gavel
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions - Tech Nirvor",
  description: "Tech Nirvor's Terms and Conditions. Read our terms of service, user agreements, and legal policies for using our platform.",
  keywords: ["terms and conditions", "terms of service", "user agreement", "legal terms", "tech nirvor terms"],
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "January 15, 2024";
  const effectiveDate = "January 1, 2024";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FileText,
      content: [
        "By accessing and using the Tech Nirvor website and services, you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service.",
        "These terms apply to all visitors, users, and others who access or use the service.",
        "Your access to and use of the service is conditioned on your acceptance of and compliance with these terms."
      ]
    },
    {
      id: "definitions",
      title: "Definitions",
      icon: FileText,
      content: [
        "\"Company\" (referred to as \"we\", \"us\", or \"our\") refers to Tech Nirvor.",
        "\"Service\" refers to the website, mobile application, and all related services provided by Tech Nirvor.",
        "\"User\" or \"Customer\" refers to any individual who accesses or uses our service.",
        "\"Products\" refers to all items, goods, and services offered for sale through our platform.",
        "\"Account\" refers to the user account created to access our services."
      ]
    },
    {
      id: "user-accounts",
      title: "User Accounts and Registration",
      icon: UserX,
      content: [
        "You must be at least 18 years old to create an account and make purchases.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You agree to provide accurate, current, and complete information during registration.",
        "You are responsible for all activities that occur under your account.",
        "We reserve the right to suspend or terminate accounts that violate these terms.",
        "One person may not maintain multiple accounts for fraudulent purposes."
      ]
    },
    {
      id: "orders-purchases",
      title: "Orders and Purchases",
      icon: ShoppingCart,
      content: [
        "All orders are subject to acceptance and availability.",
        "We reserve the right to refuse or cancel any order for any reason.",
        "Prices are subject to change without notice until the order is confirmed.",
        "Product descriptions and images are for informational purposes and may vary slightly.",
        "We strive to display accurate colors and details, but cannot guarantee exact representation.",
        "Bulk orders may be subject to additional terms and conditions."
      ]
    },
    {
      id: "payment-terms",
      title: "Payment Terms",
      icon: CreditCard,
      content: [
        "Payment is required at the time of order placement unless otherwise specified.",
        "We accept various payment methods including cash on delivery, mobile banking, and cards.",
        "All payments are processed securely through encrypted channels.",
        "For cash on delivery orders, payment must be made upon receipt of goods.",
        "Failed payments may result in order cancellation.",
        "Refunds will be processed according to our return policy."
      ]
    },
    {
      id: "shipping-delivery",
      title: "Shipping and Delivery",
      icon: Truck,
      content: [
        "Delivery times are estimates and may vary based on location and product availability.",
        "We are not responsible for delays caused by weather, natural disasters, or other unforeseen circumstances.",
        "Customers must provide accurate delivery addresses and contact information.",
        "Risk of loss and title for products pass to the customer upon delivery.",
        "Delivery attempts will be made during business hours unless otherwise arranged.",
        "Additional charges may apply for special delivery requests or remote locations."
      ]
    },
    {
      id: "product-warranty",
      title: "Product Quality and Warranty",
      icon: Shield,
      content: [
        "We guarantee that all products are authentic and as described.",
        "Manufacturer warranties apply where applicable and are handled directly with manufacturers.",
        "We inspect products before shipping to ensure quality standards.",
        "Defective products may be returned or exchanged according to our return policy.",
        "We are not responsible for damage caused by misuse or normal wear and tear.",
        "Warranty claims must be made within the specified warranty period."
      ]
    },
    {
      id: "user-conduct",
      title: "User Conduct and Prohibited Activities",
      icon: AlertTriangle,
      content: [
        "Users must not engage in fraudulent, illegal, or harmful activities.",
        "Providing false information or impersonating others is prohibited.",
        "Users may not attempt to hack, disrupt, or damage our systems.",
        "Spam, harassment, or abusive behavior towards staff or other users is not tolerated.",
        "Users may not resell products for commercial purposes without authorization.",
        "Violation of these terms may result in account suspension or legal action."
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      icon: Scale,
      content: [
        "All content on our website is protected by copyright and other intellectual property laws.",
        "The Tech Nirvor name, logo, and trademarks are our exclusive property.",
        "Users may not reproduce, distribute, or create derivative works without permission.",
        "Product images and descriptions are provided by manufacturers and suppliers.",
        "User-generated content (reviews, comments) may be used by us for promotional purposes.",
        "We respect intellectual property rights and will respond to valid infringement claims."
      ]
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: Gavel,
      content: [
        "Our liability is limited to the maximum extent permitted by law.",
        "We are not liable for indirect, incidental, or consequential damages.",
        "Our total liability shall not exceed the amount paid for the specific product or service.",
        "We are not responsible for third-party actions or services.",
        "Users assume responsibility for their use of products and services.",
        "Some jurisdictions do not allow limitation of liability, so these limitations may not apply."
      ]
    },
    {
      id: "privacy-data",
      title: "Privacy and Data Protection",
      icon: Shield,
      content: [
        "Your privacy is important to us and is governed by our Privacy Policy.",
        "We collect and use personal information as described in our Privacy Policy.",
        "We implement appropriate security measures to protect your data.",
        "You have rights regarding your personal data as outlined in our Privacy Policy.",
        "We may use cookies and tracking technologies to improve our services.",
        "Data may be shared with third parties only as described in our Privacy Policy."
      ]
    },
    {
      id: "termination",
      title: "Termination",
      icon: UserX,
      content: [
        "We may terminate or suspend your account immediately for violations of these terms.",
        "You may terminate your account at any time by contacting customer service.",
        "Upon termination, your right to use the service ceases immediately.",
        "Termination does not affect pending orders or obligations.",
        "We reserve the right to delete inactive accounts after extended periods.",
        "Certain provisions of these terms survive termination."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Terms and Conditions
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Please read these terms carefully before using our services.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Last Updated: {lastUpdated}
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Effective: {effectiveDate}
            </Badge>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Welcome to Tech Nirvor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  These Terms and Conditions (\"Terms\") govern your use of the Tech Nirvor website and services 
                  operated by Tech Nirvor (\"we\", \"us\", or \"our\"). These Terms apply to all visitors, users, 
                  and others who access or use our service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using our service, you agree to be bound by these Terms. If you disagree with 
                  any part of these terms, then you may not access the service.
                </p>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-medium">
                    <strong>Important:</strong> Please read these terms carefully and keep a copy for your records. 
                    These terms include important information about your rights and obligations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Terms Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <Card key={section.id} id={section.id}>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                        {index + 1}. {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-3">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Governing Law */}
            <Card className="mt-12">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-blue-600" />
                  Governing Law and Jurisdiction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  These Terms shall be interpreted and governed by the laws of Bangladesh. Any disputes arising 
                  from these terms or your use of our services shall be subject to the exclusive jurisdiction 
                  of the courts of Dhaka, Bangladesh.
                </p>
                <p className="text-gray-700">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision 
                  shall be limited or eliminated to the minimum extent necessary so that these Terms shall 
                  otherwise remain in full force and effect.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Questions About These Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Email:</strong> legal@technirvor.com</p>
                  <p><strong>Phone:</strong> +880 1410-077761</p>
                  <p><strong>Address:</strong> 123 Commerce Street, Dhaka 1000, Bangladesh</p>
                  <p><strong>Business Hours:</strong> 9:00 AM - 6:00 PM (Monday to Friday)</p>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Changes to These Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                  we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
                <p className="text-gray-700">
                  What constitutes a material change will be determined at our sole discretion. By continuing 
                  to access or use our service after those revisions become effective, you agree to be bound 
                  by the revised terms.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    <strong>Stay Updated:</strong> We recommend checking this page periodically for any changes. 
                    The \"Last Updated\" date at the top of this page indicates when these terms were last revised.
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