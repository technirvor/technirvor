"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  MessageCircle,
  X,
  Loader2,
  Send,
  Sparkles,
  ShoppingBag,
  Search,
  Package,
  Heart,
  Zap,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
} from "lucide-react";
import ProductCard from "./product-card";
import type { Product } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "./ui/use-toast";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text?: string;
  products?: Product[];
  timestamp: Date;
  type?: "text" | "product_search" | "order_tracking" | "suggestion";
  isTyping?: boolean;
  reactions?: {
    helpful: boolean;
    notHelpful: boolean;
  };
}

export default function ChatAgent() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const generateMessageId = () => Math.random().toString(36).substr(2, 9);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setIsTyping(true);
    const currentMessage = message;
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      text: currentMessage,
      timestamp: new Date(),
      type: "text",
    };
    const newHistoryForUI: ChatMessage[] = [...chatHistory, userMessage];
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
            id: generateMessageId(),
            role: "model",
            text: responseData.text,
            products: responseData.products,
            timestamp: new Date(),
            type: "product_search",
            reactions: { helpful: false, notHelpful: false },
          },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            id: generateMessageId(),
            role: "model",
            text: responseData.text,
            timestamp: new Date(),
            type: "text",
            reactions: { helpful: false, notHelpful: false },
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          role: "model",
          text: "Sorry, I encountered an error.",
          timestamp: new Date(),
          type: "text",
          reactions: { helpful: false, notHelpful: false },
        },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
  };

  const quickActions = [
    {
      icon: Search,
      label: "Search Products",
      action: "Show me popular products",
    },
    { icon: Package, label: "Track Order", action: "I want to track my order" },
    {
      icon: Heart,
      label: "Recommendations",
      action: "Give me some recommendations",
    },
    { icon: Zap, label: "Flash Sale", action: "Show me flash sale items" },
  ];

  const conversationStarters = [
    "What are your best selling products?",
    "Show me laptops under 50000 taka",
    "I need a smartphone recommendation",
    "What's on sale today?",
  ];

  const handleQuickAction = (action: string) => {
    setMessage(action);
    handleSubmit(new Event("submit") as any);
  };

  const handleReaction = (
    messageId: string,
    reaction: "helpful" | "notHelpful",
  ) => {
    setChatHistory((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: {
              helpful: reaction === "helpful" ? !msg.reactions?.helpful : false,
              notHelpful:
                reaction === "notHelpful" ? !msg.reactions?.notHelpful : false,
            },
          };
        }
        return msg;
      }),
    );
    toast({
      description:
        reaction === "helpful"
          ? "Thanks for your feedback!"
          : "We'll improve our responses.",
      duration: 2000,
    });
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Message copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <>
      {!isOpen && (
        <Button
          className="fixed bottom-20 left-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-16 sm:w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-primary-foreground transition-all duration-300 ease-in-out transform hover:scale-105 z-[60] group border-2 border-primary/20 md:bottom-6 md:right-6 md:left-auto"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI chat assistant"
        >
          <div className="relative">
            <Bot className="h-5 w-5 sm:h-7 sm:w-7 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse border-2 border-white" />
            {chatHistory.length > 0 && (
              <div className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
        </Button>
      )}

      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Desktop Overlay - Click outside to close */}
          <div
            className="hidden sm:block fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Container */}
          <Card className="fixed bottom-16 right-0 left-0 h-[calc(100vh-6rem)] sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] shadow-2xl border-2 border-primary/20 z-[60] bg-background/95 backdrop-blur-sm sm:rounded-xl flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b border-border bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground sm:rounded-t-xl">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <div className="relative">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" />
                </div>
                <span className="hidden sm:inline">
                  Tech Sahayak (টেক সহায়ক)
                </span>
                <span className="sm:hidden">Tech Sahayak</span>
              </CardTitle>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  aria-label="Clear chat"
                  className="text-primary-foreground hover:bg-primary/80 transition-colors duration-200 h-8 w-8 sm:h-auto sm:w-auto"
                  title="Clear chat history"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="text-primary-foreground hover:bg-primary/80 transition-colors duration-200 h-8 w-8 sm:h-auto sm:w-auto"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <ScrollArea
                ref={scrollAreaRef}
                className="flex-1 px-3 sm:px-4 py-2 h-full"
              >
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-2">
                    <div className="relative mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                        <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      আপনাকে স্বাগতম!
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-xs">
                      আমি Tech Sahayak। আপনার পণ্য খোঁজা, পরামর্শ এবং অর্ডার
                      ট্র্যাকিংয়ে সাহায্য করতে এখানে আছি।
                    </p>

                    {/* Quick Actions */}
                    <div className="w-full mb-4 sm:mb-6">
                      <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-left">
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        {quickActions.map((action, index) => {
                          const IconComponent = action.icon;
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAction(action.action)}
                              className="flex items-center gap-1.5 sm:gap-2 h-auto py-2 sm:py-3 px-2 sm:px-3 text-xs hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                            >
                              <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="text-left leading-tight text-xs">
                                {action.label}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Conversation Starters */}
                    <div className="w-full">
                      <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-left">
                        Try asking:
                      </h4>
                      <div className="space-y-1 sm:space-y-2">
                        {conversationStarters.map((starter, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickAction(starter)}
                            className="w-full text-left justify-start text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 h-auto py-1.5 sm:py-2"
                          >
                            "{starter}"
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3 sm:space-y-4 pb-4 min-h-full">
                  {chatHistory.map((chat, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex group",
                        chat.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div className="flex items-start gap-1.5 sm:gap-2 max-w-[90%] sm:max-w-[85%]">
                        {chat.role === "model" && (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                          </div>
                        )}
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                          <div
                            className={cn(
                              "p-2.5 sm:p-3 rounded-2xl shadow-md animate-fade-in relative",
                              chat.role === "user"
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-muted text-muted-foreground rounded-bl-none",
                            )}
                          >
                            {chat.text && (
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs sm:text-sm leading-relaxed flex-1">
                                  {renderTextWithLinks(chat.text)}
                                </p>
                                {chat.role === "model" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyMessage(chat.text!)}
                                    className="h-5 w-5 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background/20"
                                  >
                                    <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                            {chat.products && chat.products.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                                {chat.products.map((product) => (
                                  <ProductCard
                                    key={product.id}
                                    product={product}
                                    className="w-full scale-90 sm:scale-100 transform-gpu"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {chat.role === "model" && chat.reactions && (
                            <div className="flex items-center gap-1 ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleReaction(chat.id, "helpful")
                                }
                                className={cn(
                                  "h-6 sm:h-7 px-1.5 sm:px-2 text-xs",
                                  chat.reactions.helpful &&
                                    "bg-green-100 text-green-700 hover:bg-green-200",
                                )}
                              >
                                <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">
                                  Helpful
                                </span>
                                <span className="sm:hidden">👍</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleReaction(chat.id, "notHelpful")
                                }
                                className={cn(
                                  "h-6 sm:h-7 px-1.5 sm:px-2 text-xs",
                                  chat.reactions.notHelpful &&
                                    "bg-red-100 text-red-700 hover:bg-red-200",
                                )}
                              >
                                <ThumbsDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">
                                  Not helpful
                                </span>
                                <span className="sm:hidden">👎</span>
                              </Button>
                            </div>
                          )}
                        </div>
                        {chat.role === "user" && (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                        </div>
                        <div className="bg-muted p-2.5 sm:p-3 rounded-2xl rounded-bl-none shadow-md">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground">
                              Thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <div className="border-t border-border bg-background/80 backdrop-blur-sm sm:rounded-b-xl">
              <form onSubmit={handleSubmit} className="flex gap-2 p-3 sm:p-4">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="পণ্য সম্পর্কে জিজ্ঞাসা করুন..."
                    disabled={loading}
                    className="pr-10 sm:pr-12 border-border focus:border-primary transition-all duration-200 bg-background/50 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }
                    }}
                  />
                  {message.trim() && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5 sm:px-2"
                      >
                        {message.length}
                      </Badge>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading || !message.trim()}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg h-9 w-9 sm:h-10 sm:w-10"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </Button>
              </form>
              {isTyping && (
                <div className="px-3 sm:px-4 pb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      <div
                        className="w-1 h-1 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-1 h-1 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-1 h-1 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span className="hidden sm:inline">
                      Tech Sahayak is typing...
                    </span>
                    <span className="sm:hidden">Typing...</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
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
