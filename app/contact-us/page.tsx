"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiry_type: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Message sent successfully! We'll get back to you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiry_type: ""
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "আমাদের অফিসে আসুন",
      details: [
        "123 Commerce Street",
        "Dhaka 1000, Bangladesh",
        "Near Gulshan Circle 1"
      ]
    },
    {
      icon: Phone,
      title: "আমাদের কল করুন",
      details: [
        "+880 1410-077761",
        "+880 1710-123456",
        "Toll-free: 16263"
      ]
    },
    {
      icon: Mail,
      title: "আমাদের ইমেইল করুন",
      details: [
        "support@technirvor.com",
        "info@technirvor.com",
        "sales@technirvor.com"
      ]
    },
    {
      icon: Clock,
      title: "ব্যবসায়িক সময়",
      details: [
        "Monday - Friday: 9:00 AM - 10:00 PM",
        "Saturday - Sunday: 10:00 AM - 8:00 PM",
        "24/7 Online Support"
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/technirvor", color: "text-blue-600" },
    { icon: Twitter, href: "https://twitter.com/technirvor", color: "text-blue-400" },
    { icon: Instagram, href: "https://instagram.com/technirvor", color: "text-pink-500" },
    { icon: Youtube, href: "https://youtube.com/@technirvor", color: "text-red-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            যোগাযোগ করুন
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            আমরা সাহায্য করতে এখানে আছি! আমাদের বন্ধুত্বপূর্ণ গ্রাহক সেবা দলের সাথে যোগাযোগ করুন।
          </p>
          <div className="flex items-center justify-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span className="text-lg">Available 24/7 for your support</span>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{info.title}</h3>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Form and Map */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Send className="w-6 h-6 text-blue-600" />
                  আমাদের একটি বার্তা পাঠান
                </CardTitle>
                <p className="text-gray-600">
                  নিচের ফর্মটি পূরণ করুন এবং আমরা যত তাড়াতাড়ি সম্ভব আপনার কাছে ফিরে আসব।
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">পূর্ণ নাম *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="আপনার পূর্ণ নাম"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">ইমেইল ঠিকানা *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">ফোন নম্বর</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+880 1XXX-XXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inquiry_type">অনুসন্ধানের ধরন *</Label>
                      <Select value={formData.inquiry_type} onValueChange={(value) => handleInputChange("inquiry_type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="অনুসন্ধানের ধরন নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">সাধারণ অনুসন্ধান</SelectItem>
                          <SelectItem value="order">অর্ডার সহায়তা</SelectItem>
                          <SelectItem value="product">পণ্য সম্পর্কিত প্রশ্ন</SelectItem>
                          <SelectItem value="return">ফেরত/রিফান্ড</SelectItem>
                          <SelectItem value="technical">প্রযুক্তিগত সহায়তা</SelectItem>
                          <SelectItem value="partnership">ব্যবসায়িক অংশীদারিত্ব</SelectItem>
                          <SelectItem value="complaint">অভিযোগ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">বিষয় *</Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="আপনার বার্তার সংক্ষিপ্ত বিষয়"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">বার্তা *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="অনুগ্রহ করে আপনার অনুসন্ধান বিস্তারিতভাবে বর্ণনা করুন..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map and Additional Info */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">আমাদের খুঁজুন</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-medium">ইন্টারঅ্যাক্টিভ ম্যাপ</p>
                      <p className="text-sm">123 Commerce Street, Dhaka 1000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">আমাদের ফলো করুন</CardTitle>
                  <p className="text-gray-600">সোশ্যাল মিডিয়ায় যুক্ত থাকুন</p>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => {
                      const IconComponent = social.icon;
                      return (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${social.color}`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Link */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-900">দ্রুত উত্তর প্রয়োজন?</h3>
                  <p className="text-gray-600 mb-4">
                    সাধারণ প্রশ্নের তাৎক্ষণিক উত্তরের জন্য আমাদের FAQ বিভাগ দেখুন।
                  </p>
                  <Button variant="outline" className="w-full">
                    FAQ বিভাগ দেখুন
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}