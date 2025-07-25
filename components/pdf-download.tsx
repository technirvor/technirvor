"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// Use dynamic import to avoid SSR and bundler issues
import React from "react";

interface PDFDownloadProps {
  targetId: string; // The id of the DOM element to print as PDF
  fileName?: string;
  label?: string;
  className?: string;
}

export function PDFDownload({
  targetId,
  fileName = "invoice.pdf",
  label = "Download PDF",
  className = "",
}: PDFDownloadProps) {
  const handleDownload = async () => {
    const input = document.getElementById(targetId);
    if (!input) {
      toast.error("Invoice content not found for PDF export.");
      return;
    }
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      // const pageHeight = pdf.internal.pageSize.getHeight()
      // Use canvas dimensions for PDF sizing
      const pdfWidth = pageWidth;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(fileName);
      toast.success("PDF downloaded!");
    } catch (err) {
      toast.error("Failed to generate PDF.");
    }
  };
  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className={`flex items-center gap-2 bg-transparent ${className}`}
    >
      <Download className="w-4 h-4" />
      {label}
    </Button>
  );
}
