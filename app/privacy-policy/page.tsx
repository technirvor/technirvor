import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, UserCheck, Database, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Tech Nirvor",
  description: "Tech Nirvor's Privacy Policy. Learn how we collect, use, and protect your personal information when you shop with us.",
  keywords: ["privacy policy", "data protection", "personal information", "tech nirvor privacy"],
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          items: [
            "Name, email address, and phone number",
            "Billing and shipping addresses",
            "Payment information (processed securely through third-party providers)",
            "Account credentials and preferences"
          ]
        },
        {
          subtitle: "Automatically Collected Information",
          items: [
            "IP address and browser information",
            "Device type and operating system",
            "Pages visited and time spent on our website",
            "Cookies and similar tracking technologies"
          ]
        },
        {
          subtitle: "Transaction Information",
          items: [
            "Purchase history and order details",
            "Product reviews and ratings",
            "Customer service interactions",
            "Return and refund requests"
          ]
        }
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: UserCheck,
      content: [
        {
          subtitle: "Service Provision",
          items: [
            "Process and fulfill your orders",
            "Provide customer support and assistance",
            "Send order confirmations and shipping updates",
            "Manage your account and preferences"
          ]
        },
        {
          subtitle: "Communication",
          items: [
            "Send promotional emails and newsletters (with your consent)",
            "Notify you about new products and special offers",
            "Respond to your inquiries and feedback",
            "Send important account and service updates"
          ]
        },
        {
          subtitle: "Improvement and Analytics",
          items: [
            "Analyze website usage and customer behavior",
            "Improve our products and services",
            "Personalize your shopping experience",
            "Conduct market research and surveys"
          ]
        }
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: Globe,
      content: [
        {
          subtitle: "Third-Party Service Providers",
          items: [
            "Payment processors for secure transaction handling",
            "Shipping and logistics partners for order delivery",
            "Email service providers for communication",
            "Analytics services for website improvement"
          ]
        },
        {
          subtitle: "Legal Requirements",
          items: [
            "Comply with applicable laws and regulations",
            "Respond to legal requests and court orders",
            "Protect our rights and prevent fraud",
            "Ensure the safety and security of our users"
          ]
        },
        {
          subtitle: "Business Transfers",
          items: [
            "In case of merger, acquisition, or sale of assets",
            "During business restructuring or reorganization",
            "With proper notice and protection of your rights"
          ]
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security and Protection",
      icon: Lock,
      content: [
        {
          subtitle: "Security Measures",
          items: [
            "SSL encryption for all data transmission",
            "Secure servers with regular security updates",
            "Access controls and authentication systems",
            "Regular security audits and monitoring"
          ]
        },
        {
          subtitle: "Payment Security",
          items: [
            "PCI DSS compliant payment processing",
            "Tokenization of sensitive payment data",
            "No storage of complete credit card information",
            "Fraud detection and prevention systems"
          ]
        },
        {
          subtitle: "Data Retention",
          items: [
            "Personal data retained only as long as necessary",
            "Account data kept while account is active",
            "Transaction records maintained for legal requirements",
            "Secure deletion of data when no longer needed"
          ]
        }
      ]
    },
    {
      id: "user-rights",
      title: "Your Rights and Choices",
      icon: Eye,
      content: [
        {
          subtitle: "Access and Control",
          items: [
            "Access and review your personal information",
            "Update or correct your account details",
            "Download a copy of your data",
            "Delete your account and associated data"
          ]
        },
        {
          subtitle: "Communication Preferences",
          items: [
            "Opt-out of promotional emails and newsletters",
            "Manage notification preferences",
            "Unsubscribe from marketing communications",
            "Control cookie and tracking preferences"
          ]
        },
        {
          subtitle: "Data Portability",
          items: [
            "Request transfer of your data to another service",
            "Export your order history and preferences",
            "Receive data in a structured, machine-readable format"
          ]
        }
      ]
    },
    {
      id: "cookies-tracking",
      title: "Cookies and Tracking Technologies",
      icon: Shield,
      content: [
        {
          subtitle: "Types of Cookies",
          items: [
            "Essential cookies for website functionality",
            "Performance cookies for analytics and optimization",
            "Functional cookies for enhanced user experience",
            "Marketing cookies for personalized advertising"
          ]
        },
        {
          subtitle: "Cookie Management",
          items: [
            "Browser settings to control cookie acceptance",
            "Opt-out options for non-essential cookies",
            "Third-party cookie policies and controls",
            "Regular review and update of cookie practices"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Last Updated: {lastUpdated}
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
                  <Shield className="w-6 h-6 text-blue-600" />
                  Our Commitment to Your Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  At Tech Nirvor, we are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
                  website or use our services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using our website and services, you agree to the collection and use of information in accordance with this policy. 
                  We will not use or share your information with anyone except as described in this Privacy Policy.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    <strong>Important:</strong> If you do not agree with our policies and practices, please do not use our services. 
                    By continuing to use our services, you accept this Privacy Policy.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Policy Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <Card key={section.id} id={section.id}>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {section.content.map((subsection, subIndex) => (
                        <div key={subIndex}>
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">
                            {subsection.subtitle}
                          </h4>
                          <ul className="space-y-2">
                            {subsection.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                          {subIndex < section.content.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Contact Information */}
            <Card className="mt-12">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Contact Us About Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Email:</strong> privacy@technirvor.com</p>
                  <p><strong>Phone:</strong> +880 1410-077761</p>
                  <p><strong>Address:</strong> 123 Commerce Street, Dhaka 1000, Bangladesh</p>
                  <p><strong>Response Time:</strong> We will respond to your inquiry within 48 hours</p>
                </div>
              </CardContent>
            </Card>

            {/* Policy Updates */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Policy Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for other 
                  operational, legal, or regulatory reasons. We will notify you of any material changes by:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">Posting the updated policy on our website</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">Sending email notifications to registered users</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">Displaying prominent notices on our website</span>
                  </li>
                </ul>
                <p className="text-gray-700">
                  Your continued use of our services after any changes indicates your acceptance of the updated Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}