"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MessageCircle, X, Loader2, Send, Sparkles } from "lucide-react";
import ProductCard from "./product-card";
import type { Product } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "model";
  text?: string;
  products?: Product[];
}

export default function ChatAgent() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    const currentMessage = message;
    const newHistoryForUI: ChatMessage[] = [
      ...chatHistory,
      { role: "user", text: currentMessage },
    ];
    setChatHistory(newHistoryForUI);
    setMessage("");

    const apiHistory = newHistoryForUI.map((chat) => ({
      role: chat.role,
      parts: chat.text ? [{ text: chat.text }] : [],
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: apiHistory, message: currentMessage }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const responseData = await res.json(); // This can contain text and/or products

      if (responseData.products && responseData.products.length > 0) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "model",
            text: responseData.text,
            products: responseData.products,
          },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: "model", text: responseData.text },
        ]);
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "model", text: "Sorry, I encountered an error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
  };

  return (
    <>
      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 z-50"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI chat assistant"
        >
          <Sparkles size={32} />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-xl rounded-lg z-50">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> AI Shopping Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                aria-label="Clear chat"
                className="text-primary-foreground hover:bg-primary/80"
              >
                <Loader2 className="w-4 h-4 rotate-90" />{" "}
                {/* Using Loader2 for a 'clear' icon, consider a better icon */}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="text-primary-foreground hover:bg-primary/80"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 pr-4 -mr-4">
              {" "}
              {/* Added pr-4 and -mr-4 to offset scrollbar */}
              <div className="space-y-4">
                {chatHistory.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>পণ্য সম্পর্কে আমাকে কিছু জিজ্ঞাসা করুন!</p>
                    <p>
                      উদাহরণস্বরূপ, "ল্যাপটপ দেখান" অথবা "আপনার সেরা ডিল কি?"
                    </p>
                  </div>
                )}
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      chat.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg shadow-sm",
                        chat.role === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none",
                      )}
                    >
                      {chat.text && (
                        <p className="text-sm">
                          {renderTextWithLinks(chat.text)}
                        </p>
                      )}
                      {chat.products && chat.products.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          {chat.products.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              className="w-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none shadow-sm">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-4 border-t bg-background"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about products..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading} size="icon">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}

// Helper function to render text with links
const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+|\/[^\s]+)/g; // Matches http/https URLs or relative paths starting with /
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      // Check if it's a relative path or full URL
      const isRelative = part.startsWith("/");
      const href = isRelative ? part : part; // For relative paths, use as is. For full URLs, use as is.
      return (
        <Link
          key={i}
          href={href}
          className="text-blue-500 hover:underline"
          target={isRelative ? "_self" : "_blank"}
          rel={isRelative ? "" : "noopener noreferrer"}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
};
