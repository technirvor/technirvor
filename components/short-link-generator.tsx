"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShortLinkGeneratorProps {
  originalUrl: string;
  title?: string;
  description?: string;
}

export default function ShortLinkGenerator({
  originalUrl,
  title,
  description,
}: ShortLinkGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customTitle, setCustomTitle] = useState(title || "");
  const [customDescription, setCustomDescription] = useState(description || "");

  const generateShortLink = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/short-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_url: originalUrl,
          title: customTitle || title,
          description: customDescription || description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const shortUrl = `${window.location.origin}/s/${data.short_code}`;
        setShortLink(shortUrl);
        toast.success("Short link generated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to generate short link");
      }
    } catch (error) {
      console.error("Error generating short link:", error);
      toast.error("An error occurred while generating the short link");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shortLink) return;

    try {
      await navigator.clipboard.writeText(shortLink);
      setCopied(true);
      toast.success("Short link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setShortLink(null);
      setCopied(false);
      setCustomTitle(title || "");
      setCustomDescription(description || "");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-transparent">
          <Link2 className="w-4 h-4 mr-2" />
          Get Short Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Short Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Custom title for the link"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Custom description for the link"
            />
          </div>

          {!shortLink ? (
            <Button
              onClick={generateShortLink}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Short Link"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Your Short Link</Label>
                <div className="flex items-center space-x-2">
                  <Input value={shortLink} readOnly className="flex-1" />
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => {
                  setShortLink(null);
                  setCustomTitle(title || "");
                  setCustomDescription(description || "");
                }}
                variant="outline"
                className="w-full"
              >
                Generate Another
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
