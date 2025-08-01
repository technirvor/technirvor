"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, CreditCard, Building2, Banknote, Shield, Clock, CheckCircle } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  processingTime: string;
  fees: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'bkash',
    name: 'bKash',
    description: 'Most popular mobile financial service in Bangladesh',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'bg-pink-600',
    features: ['Instant transfer', 'Wide acceptance', '24/7 available'],
    processingTime: 'Instant',
    fees: 'No additional fees'
  },
  {
    id: 'nagad',
    name: 'Nagad',
    description: 'Government-backed digital financial service',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'bg-orange-600',
    features: ['Secure transactions', 'Government backed', 'Low fees'],
    processingTime: 'Instant',
    fees: 'No additional fees'
  },
  {
    id: 'rocket',
    name: 'Rocket',
    description: 'DBBL mobile financial service',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'bg-purple-600',
    features: ['Bank integration', 'Reliable service', 'Wide network'],
    processingTime: 'Instant',
    fees: 'No additional fees'
  },
  {
    id: 'upay',
    name: 'Upay',
    description: 'UCB Fintech mobile wallet',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'bg-blue-600',
    features: ['Modern interface', 'Quick setup', 'Secure payments'],
    processingTime: 'Instant',
    fees: 'No additional fees'
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'International and local cards accepted',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'bg-blue-700',
    features: ['Visa/Mastercard', 'SSL encrypted', 'International support'],
    processingTime: '1-2 minutes',
    fees: 'Gateway fees may apply'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank account transfer',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-green-600',
    features: ['Direct transfer', 'No intermediary', 'Bank security'],
    processingTime: '1-24 hours',
    fees: 'Bank charges may apply'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: <Banknote className="w-6 h-6" />,
    color: 'bg-gray-600',
    features: ['No advance payment', 'Inspect before pay', 'Most secure'],
    processingTime: 'On delivery',
    fees: 'No additional fees'
  }
];

export default function PaymentMethodsInfo() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Methods</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We support multiple payment methods to make your shopping experience convenient and secure.
          Choose the method that works best for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white`}>
                  {method.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{method.name}</CardTitle>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {method.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{method.processingTime}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {method.fees}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="w-5 h-5" />
            Security & Trust
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Your Payment is Secure</h4>
              <ul className="text-sm space-y-1">
                <li>• SSL encryption for all transactions</li>
                <li>• No card details stored on our servers</li>
                <li>• PCI DSS compliant payment processing</li>
                <li>• 24/7 fraud monitoring</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Customer Protection</h4>
              <ul className="text-sm space-y-1">
                <li>• Money-back guarantee</li>
                <li>• Dispute resolution support</li>
                <li>• Order tracking and updates</li>
                <li>• Customer service support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Pay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-pink-700">Mobile Financial Services (bKash, Nagad, Rocket, Upay)</h4>
              <ol className="text-sm space-y-2 text-gray-700">
                <li>1. Select your preferred mobile payment method</li>
                <li>2. Complete your order details</li>
                <li>3. Use the provided merchant number to send money</li>
                <li>4. Enter the transaction ID in the order form</li>
                <li>5. Submit your order</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-blue-700">Card Payment & Bank Transfer</h4>
              <ol className="text-sm space-y-2 text-gray-700">
                <li>1. Select card payment or bank transfer</li>
                <li>2. Complete your order details</li>
                <li>3. Follow the payment gateway instructions</li>
                <li>4. Complete the secure payment process</li>
                <li>5. Receive order confirmation</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}