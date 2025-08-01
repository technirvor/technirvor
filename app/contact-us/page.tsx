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
      title: "Visit Our Office",
      details: [
        "123 Commerce Street",
        "Dhaka 1000, Bangladesh",
        "Near Gulshan Circle 1"
      ]
    },
    {
      icon: Phone,
      title: "Call Us",
      details: [
        "+880 1410-077761",
        "+880 1710-123456",
        "Toll-free: 16263"
      ]
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [
        "support@technirvor.com",
        "info@technirvor.com",
        "sales@technirvor.com"
      ]
    },
    {
      icon: Clock,
      title: "Business Hours",
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
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            We're here to help! Get in touch with our friendly customer service team.
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
                  Send us a Message
                </CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
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
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+880 1XXX-XXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inquiry_type">Inquiry Type *</Label>
                      <Select value={formData.inquiry_type} onValueChange={(value) => handleInputChange("inquiry_type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="order">Order Support</SelectItem>
                          <SelectItem value="product">Product Question</SelectItem>
                          <SelectItem value="return">Return/Refund</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="partnership">Business Partnership</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Brief subject of your message"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Please describe your inquiry in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map and Additional Info */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Find Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-medium">Interactive Map</p>
                      <p className="text-sm">123 Commerce Street, Dhaka 1000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Follow Us</CardTitle>
                  <p className="text-gray-600">Stay connected on social media</p>
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
                  <h3 className="text-lg font-bold mb-2 text-gray-900">Need Quick Answers?</h3>
                  <p className="text-gray-600 mb-4">
                    Check our FAQ section for instant answers to common questions.
                  </p>
                  <Button variant="outline" className="w-full">
                    Visit FAQ Section
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