'use client';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface PrintButtonProps {
  targetId?: string; // Optional: print a specific DOM element by id
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function PrintButton({
  targetId,
  label = 'Print',
  className = '',
  disabled = false,
}: PrintButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handlePrint = () => {
    if (loading || disabled) return;
    setLoading(true);
    setTimeout(() => {
      try {
        if (targetId) {
          const printContents = document.getElementById(targetId);
          if (printContents) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write('<html><head><title>Print</title>');
              printWindow.document.write(`
                <style>
                  @media print {
                    html, body {
                      background: #fff !important;
                      color: #222 !important;
                      font-family: "Inter", Arial, sans-serif !important;
                      font-size: 13px;
                      margin: 0;
                      padding: 0;
                    }
                    .print\:hidden, .no-print { display: none !important; }
                    .shadow-lg, .shadow, .border, .rounded-xl, .rounded-lg, .rounded, .bg-gray-50, .bg-white {
                      box-shadow: none !important;
                      border: none !important;
                      background: #fff !important;
                    }
                    .p-8, .p-6, .px-6, .py-4, .pt-6, .pb-6, .mt-4, .mb-4, .mx-auto {
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                    table {
                      width: 100% !important;
                      border-collapse: collapse !important;
                    }
                    th, td {
                      border: 1px solid #ddd !important;
                      padding: 6px 8px !important;
                    }
                    th {
                      background: #f3f4f6 !important;
                      color: #222 !important;
                    }
                    h1, h2, h3, h4, h5, h6 {
                      color: #222 !important;
                      margin: 0 0 8px 0 !important;
                    }
                    .text-gray-600, .text-gray-500, .text-gray-700, .text-gray-900 {
                      color: #222 !important;
                    }
                    .text-xs, .text-sm, .text-lg, .text-2xl, .text-3xl, .font-bold, .font-semibold {
                      font-weight: 500 !important;
                    }
                  }
                  body { font-family: "Inter", Arial, sans-serif; padding: 24px; background: #fff; color: #222; }
                </style>
              `);
              printWindow.document.write('</head><body>');
              printWindow.document.write(printContents.innerHTML);
              printWindow.document.write('</body></html>');
              printWindow.document.close();
              printWindow.focus();
              printWindow.print();
              printWindow.close();
            } else {
              toast.error('Unable to open print window.');
            }
          } else {
            toast.error('Content not found for printing.');
          }
        } else {
          window.print();
        }
      } catch (err) {
        toast.error('Print failed.');
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  return (
    <Button
      onClick={handlePrint}
      className={`flex items-center gap-2 ${className}`}
      aria-label={label}
      disabled={loading || disabled}
    >
      <Printer className="w-4 h-4" />
      {loading ? 'Printing...' : label}
    </Button>
  );
}
