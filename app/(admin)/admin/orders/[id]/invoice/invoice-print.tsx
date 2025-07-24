'use client';
import Image from 'next/image';
import { PrintButton } from '@/components/print-button';
import { PDFDownload } from '@/components/pdf-download';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail } from 'lucide-react';
import type { Order } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  order: Order;
}

export default function InvoicePrint({ order }: Props) {
  const handleEmail = () => {
    // In a real app, you'd send email here
    toast.success('Email would be sent here');
  };

  const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const deliveryCharge = 60; // Default delivery charge
  const total = subtotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Invoice #{order.order_number}</h1>
          <div className="flex gap-3">
            <PrintButton targetId="invoice-content" />
            <PDFDownload
              targetId="invoice-content"
              fileName={`invoice-${order.id.slice(0, 8)}.pdf`}
            />
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              <Mail className="w-4 h-4" />
              Email Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div id="invoice-content" className="max-w-4xl mx-auto p-6">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tech Nirvor</h1>
                <p className="text-gray-600">Your trusted online shopping partner</p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>123 Business Street</p>
                  <p>Dhaka, Bangladesh</p>
                  <p>Phone: +880 1234-567890</p>
                  <p>Email: info@technirvor.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Invoice #:</strong> {order.order_number}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-GB')}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'confirmed'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Customer Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-600">
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                  <p>{order.customer_phone}</p>
                  <p>{order.address}</p>
                  <p>{order.district}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method:</h3>
                <div className="text-gray-600">
                  <p className="font-medium">{order.payment_method.toUpperCase()}</p>
                  <p>Cash on Delivery</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items:</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-900">Item</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-900">Qty</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-900">Unit Price</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <Image
                              src={item.product.image_url || '/placeholder.svg?height=40&width=40'}
                              alt={item.product.name}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-600">
                                SKU: {item.product.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center">{item.quantity}</td>
                        <td className="py-4 px-2 text-right">৳{item.price.toLocaleString()}</td>
                        <td className="py-4 px-2 text-right font-medium">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge:</span>
                    <span>৳{deliveryCharge.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">Thank you for shopping with Tech Nirvor!</p>
                <p>For any queries, contact us at +880 1234-567890 or info@technirvor.com</p>
                <p className="mt-4 text-xs">
                  This is a computer-generated invoice and does not require a signature.
                </p>
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <div className="text-6xl font-bold text-gray-400 transform rotate-45">
                Tech Nirvor
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          .bg-gray-50 {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
