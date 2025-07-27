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
          className="fixed lg:bottom-6 bottom-20 right-6 rounded-full w-16 h-16 shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105 z-50 group"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI chat assistant"
        >
          <Sparkles size={32} className="group-hover:animate-pulse" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none">
          <div className="flex-1" onClick={() => setIsOpen(false)}></div>
          <Card className="fixed bottom-0 right-0 w-full h-[calc(100%-4rem)] flex flex-col shadow-2xl sm:bottom-6 sm:right-6 sm:w-96 sm:h-[calc(100%-8rem)] sm:max-h-[700px] sm:rounded-xl backdrop-blur-md bg-card/80 sm:border border-border pb-16">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground sm:rounded-t-xl">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-foreground" /> AI
                Shopping Assistant
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  aria-label="Clear chat"
                  className="text-primary-foreground hover:bg-primary/80 transition-colors duration-200"
                >
                  <MessageCircle className="w-4 h-4 rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="text-primary-foreground hover:bg-primary/80 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-hidden flex flex-col bg-transparent">
              <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-4 pb-4">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">
                        পণ্য সম্পর্কে আমাকে কিছু জিজ্ঞাসা করুন!
                      </p>
                      <p className="text-xs mt-1">
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
                          "max-w-[80%] p-3 rounded-2xl shadow-md animate-fade-in",
                          chat.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-muted-foreground rounded-bl-none",
                        )}
                      >
                        {chat.text && (
                          <p className="text-sm leading-relaxed">
                            {renderTextWithLinks(chat.text)}
                          </p>
                        )}
                        {chat.products && chat.products.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
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
                      <div className="bg-muted p-3 rounded-2xl rounded-bl-none shadow-md">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 p-4 border-t border-border bg-transparent"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about products..."
                disabled={loading}
                className="flex-1 rounded-full px-4 py-2 border border-input focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 bg-background/70"
              />
              <Button
                type="submit"
                disabled={loading}
                size="icon"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </Card>
        </div>
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
