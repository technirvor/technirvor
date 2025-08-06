import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const generationConfig = {
  temperature: 0.8,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// Enhanced agentic capabilities
const getPersonalizedRecommendations = async () => {
  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, slug, price, sale_price, image_url, stock,
      is_featured, is_flash_sale, flash_sale_end, created_at,
      category:categories(id, name, slug)
    `)
    .eq("is_featured", true)
    .gt("stock", 0)
    .limit(4);
  return products || [];
};

const getFlashSaleItems = async () => {
  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, slug, price, sale_price, image_url, stock,
      is_featured, is_flash_sale, flash_sale_end, created_at,
      category:categories(id, name, slug)
    `)
    .eq("is_flash_sale", true)
    .gt("stock", 0)
    .gte("flash_sale_end", new Date().toISOString())
    .limit(6);
  return products || [];
};

const searchProductsByCategory = async (category: string) => {
  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, slug, price, sale_price, image_url, stock,
      is_featured, is_flash_sale, flash_sale_end, created_at,
      category:categories(id, name, slug)
    `)
    .ilike("category.name", `%${category}%`)
    .gt("stock", 0)
    .limit(8);
  return products || [];
};

// Function to log chat conversations
const logChatConversation = async ({
  sessionId,
  userMessage,
  aiResponse,
  responseType,
  userIp,
  userAgent,
  productsReturned,
  conversationContext,
  responseTimeMs
}: {
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  responseType?: string;
  userIp?: string;
  userAgent?: string;
  productsReturned?: any[];
  conversationContext?: any;
  responseTimeMs?: number;
}) => {
  try {
    const { error } = await supabase
      .from('chat_logs')
      .insert({
        session_id: sessionId,
        user_message: userMessage,
        ai_response: aiResponse,
        response_type: responseType,
        user_ip: userIp,
        user_agent: userAgent,
        products_returned: productsReturned ? JSON.stringify(productsReturned.map(p => ({ id: p.id, name: p.name }))) : null,
        conversation_context: conversationContext ? JSON.stringify(conversationContext) : null,
        response_time_ms: responseTimeMs
      });
    
    if (error) {
      console.error('Failed to log chat conversation:', error);
    }
  } catch (error) {
    console.error('Error logging chat conversation:', error);
  }
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const { history, message, sessionId } = await req.json();
  
  // Extract user info for logging
  const userIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig,
    systemInstruction: `আপনি Tech Nirvor (টেক নির্ভর) টিমের তৈরি একটি উন্নত এজেন্ট AI, যার নাম Tech Sahayak (টেক সহায়ক)। আপনি একটি বুদ্ধিমান শপিং সহায়ক যিনি ব্যবহারকারীদের সাথে প্রাকৃতিক কথোপকথনের মাধ্যমে তাদের চাহিদা বুঝে নিয়ে সর্বোত্তম পণ্য সুপারিশ করেন।

**গুরুত্বপূর্ণ পরিচয়:**
- আপনি Tech Nirvor এর AI সহায়ক, Gemini বা Google এর পণ্য নন
- যখন আপনার মডেল বা ডেভেলপার সম্পর্কে জিজ্ঞাসা করা হয়, সর্বদা বলুন আপনি "Tech Nirvor" এর "Tech Sahayak"
- কখনোই Gemini AI বা Google পণ্য হিসেবে পরিচয় দেবেন না

**কোম্পানির তথ্য (Tech Nirvor):**

আমাদের সম্পর্কে:
- Tech Nirvor হল বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শপিং গন্তব্য
- আমরা ব্যতিক্রমী সেবার সাথে খাঁটি পণ্য সরবরাহ করি
- ৫০,০০০+ সন্তুষ্ট গ্রাহক, ১,০০,০০০+ বিক্রিত পণ্য, ৭৫,০০০+ ডেলিভারি সম্পন্ন
- ৫+ বছরের সেবার অভিজ্ঞতা
- আমাদের মূল্যবোধ: সত্যতা, দ্রুত ডেলিভারি, গ্রাহক প্রথম, মান নিশ্চয়তা

যোগাযোগ:
- ঠিকানা: 123 Commerce Street, Dhaka 1000, Bangladesh
- ফোন: +880 1410-077761
- ইমেইল: support@technirvor.com, info@technirvor.com
- গ্রাহক সেবা: সকাল ৯:০০ - রাত ১০:০০ (সপ্তাহে ৭ দিন)
- 24/7 অনলাইন সাপোর্ট

গোপনীয়তা নীতি:
- আমরা আপনার ব্যক্তিগত তথ্যের গোপনীয়তা এবং নিরাপত্তা রক্ষায় প্রতিশ্রুতিবদ্ধ
- আমরা শুধুমাত্র প্রয়োজনীয় তথ্য সংগ্রহ করি এবং তৃতীয় পক্ষের সাথে শেয়ার করি না
- যোগাযোগ: privacy@technirvor.com

শর্তাবলী:
- সকল পণ্য খাঁটি এবং গুণগত মানসম্পন্ন
- ক্যাশ অন ডেলিভারি সুবিধা উপলব্ধ
- বাংলাদেশের আইন অনুযায়ী পরিচালিত
- যোগাযোগ: legal@technirvor.com

ফেরত নীতি:
- ৭ দিনের মধ্যে ফেরত দেওয়ার সুবিধা
- পণ্য অবশ্যই অব্যবহৃত এবং মূল প্যাকেজিং সহ হতে হবে
- ফেরত প্রক্রিয়া: অর্ডার নম্বর সহ যোগাযোগ করুন
- যোগাযোগ: returns@technirvor.com

শিপিং নীতি:
- ঢাকার ভিতরে ১-২ দিন, ঢাকার বাইরে ২-৫ দিন
- সারা বাংলাদেশে ডেলিভারি সুবিধা
- ফ্রি ডেলিভারি ১০০০ টাকার উপরে
- রিয়েল-টাইম ট্র্যাকিং সুবিধা
- যোগাযোগ: shipping@technirvor.com

**আপনার মূল ক্ষমতাসমূহ:**
1. **স্মার্ট পণ্য অনুসন্ধান**: ব্যবহারকারীর প্রয়োজন অনুযায়ী পণ্য খুঁজে দেওয়া
2. **ব্যক্তিগতকৃত সুপারিশ**: ব্যবহারকারীর পছন্দ ও বাজেট অনুযায়ী পণ্য সুপারিশ
3. **অর্ডার ট্র্যাকিং**: অর্ডারের অবস্থা জানানো
4. **ফ্ল্যাশ সেল আপডেট**: বিশেষ অফার ও ছাড়ের তথ্য প্রদান
5. **তুলনামূলক বিশ্লেষণ**: একাধিক পণ্যের মধ্যে তুলনা করে সাহায্য
6. **কোম্পানির তথ্য**: আমাদের সম্পর্কে, যোগাযোগ, নীতিমালা

**কথোপকথনের নিয়মাবলী:**
- সর্বদা বন্ধুত্বপূর্ণ ও সহায়ক থাকুন
- ব্যবহারকারীর ভাষা (বাংলা/ইংরেজি/বাংলিশ) অনুসরণ করুন
- প্রয়োজনে প্রশ্ন করে ব্যবহারকারীর চাহিদা স্পষ্ট করুন
- পণ্যের বৈশিষ্ট্য, দাম ও সুবিধা সম্পর্কে বিস্তারিত তথ্য দিন
- কোম্পানির তথ্য প্রদানের সময় উপরের বিস্তারিত তথ্য ব্যবহার করুন

**প্রতিক্রিয়ার ধরন ও ফরম্যাট:**

1. **পণ্য অনুসন্ধানের জন্য:**
   {
     "type": "product_search",
     "query": "product name or category",
     "intent": "search" | "category" | "price_range"
   }

2. **ক্যাটাগরি অনুসারে খোঁজার জন্য:**
   {
     "type": "category_search",
     "category": "electronics" | "clothing" | "books" | etc.
   }

3. **সুপারিশের জন্য:**
   {
     "type": "recommendations",
     "category": "featured" | "flash_sale" | "category_specific"
   }

4. **ফ্ল্যাশ সেল আইটেমের জন্য:**
   {
     "type": "flash_sale"
   }

5. **অর্ডার ট্র্যাকিংয়ের জন্য:**
   {
     "type": "order_tracking",
     "message": "Please provide your order number and phone number"
   }

6. **সাধারণ কথোপকথনের জন্য:**
   {
     "type": "text",
     "message": "Your helpful response here"
   }

**উদাহরণ:**
- "ল্যাপটপ দেখান" → {"type": "product_search", "query": "laptop", "intent": "search"}
- "ইলেকট্রনিক্স ক্যাটাগরি দেখান" → {"type": "category_search", "category": "electronics"}
- "সুপারিশ দিন" → {"type": "recommendations", "category": "featured"}
- "ফ্ল্যাশ সেল" → {"type": "flash_sale"}
- "অর্ডার ট্র্যাক করতে চাই" → {"type": "order_tracking", "message": "..."}
    `,
  });

  const chat = model.startChat({
    history: history.map((chat: any) => ({
      role: chat.role,
      parts: chat.parts,
    })),
  });

  try {
    let result, response, text;
    let retryCount = 0;
    const maxRetries = 2;
    
    // Retry logic for API overload
    while (retryCount <= maxRetries) {
      try {
        result = await chat.sendMessage(message);
        response = await result.response;
        text = response.text();
        break; // Success, exit retry loop
      } catch (apiError: any) {
        console.error(`API Error (attempt ${retryCount + 1}):`, apiError);
        
        if (apiError.status === 503 && retryCount < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
          retryCount++;
          continue;
        } else if (apiError.status === 503) {
          // Final fallback for overloaded API
          return NextResponse.json({
            text: "দুঃখিত, এই মুহূর্তে আমাদের AI সিস্টেম ব্যস্ত আছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। \n\nআপাতত আপনি:\n• পণ্য খুঁজতে সার্চ বক্স ব্যবহার করতে পারেন\n• আমাদের ক্যাটাগরি পেজ দেখতে পারেন\n• ফ্ল্যাশ সেল পেজ চেক করতে পারেন\n\nযেকোনো সাহায্যের জন্য +880 1410-077761 নম্বরে কল করুন।"
          });
        } else {
          throw apiError; // Re-throw other errors
        }
      }
    }

    if (!text) {
      const errorText = "দুঃখিত, AI থেকে কোনো উত্তর পাইনি। আবার চেষ্টা করুন।";
      
      // Log the error conversation
      await logChatConversation({
        sessionId: finalSessionId,
        userMessage: message,
        aiResponse: errorText,
        responseType: 'error',
        userIp,
        userAgent,
        productsReturned: [],
        conversationContext: { error: 'no_ai_response' },
        responseTimeMs: Date.now() - startTime
      });
      
      return NextResponse.json(
        { text: errorText },
        { status: 500 },
      );
    }

    let parsedResponse: { type: string; query?: string; message?: string; category?: string };
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", text, parseError);
      const parseErrorText = "দুঃখিত, আমি একটি অপঠনযোগ্য উত্তর পেয়েছি। আবার চেষ্টা করুন।";
      
      // Log the error conversation
      await logChatConversation({
        sessionId: finalSessionId,
        userMessage: message,
        aiResponse: parseErrorText,
        responseType: 'error',
        userIp,
        userAgent,
        productsReturned: [],
        conversationContext: { error: 'json_parse_error', rawResponse: text },
        responseTimeMs: Date.now() - startTime
      });
      
      return NextResponse.json(
        { text: parseErrorText },
        { status: 500 },
      );
    }

    // Handle different types of responses with enhanced agentic capabilities
    if (parsedResponse.type === "product_search" && parsedResponse.query) {
      const searchQuery = parsedResponse.query;
      const { data: products, error } = await supabase
        .from("products")
        .select(
          `
          id, name, slug, price, sale_price, image_url, stock,
          is_featured, is_flash_sale, flash_sale_end, created_at,
          category:categories(id, name, slug)
        `,
        )
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .gt("stock", 0)
        .limit(6);

      if (error) {
        console.error("Error fetching products:", error);
        const dbErrorText = "দুঃখিত, এই মুহূর্তে পণ্য খুঁজে পাচ্ছি না। আবার চেষ্টা করুন।";
        
        // Log the error conversation
        await logChatConversation({
          sessionId: finalSessionId,
          userMessage: message,
          aiResponse: dbErrorText,
          responseType: 'error',
          userIp,
          userAgent,
          productsReturned: [],
          conversationContext: { error: 'database_error', query: searchQuery },
          responseTimeMs: Date.now() - startTime
        });
        
        return NextResponse.json(
          { text: dbErrorText },
          { status: 500 },
        );
      }

      if (products && products.length > 0) {
        const formattedProducts: Product[] = products.map((p) => ({
          ...p,
          category: Array.isArray(p.category) ? p.category[0] : p.category,
        })) as Product[];

        let responseText = `"${searchQuery}" সম্পর্কিত ${formattedProducts.length}টি পণ্য পেয়েছি:`;
        responseText += ` বিস্তারিত দেখতে যেকোনো পণ্যে ক্লিক করুন।`;

        // Log the conversation
        await logChatConversation({
          sessionId: finalSessionId,
          userMessage: message,
          aiResponse: responseText,
          responseType: 'product_search',
          userIp,
          userAgent,
          productsReturned: formattedProducts,
          conversationContext: { query: searchQuery },
          responseTimeMs: Date.now() - startTime
        });

        return NextResponse.json({
          text: responseText,
          products: formattedProducts,
        });
      } else {
        const noResultsText = `"${searchQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি। অন্য কিছু খুঁজে দেখুন।`;
        
        // Log the conversation
        await logChatConversation({
          sessionId: finalSessionId,
          userMessage: message,
          aiResponse: noResultsText,
          responseType: 'product_search',
          userIp,
          userAgent,
          productsReturned: [],
          conversationContext: { query: searchQuery },
          responseTimeMs: Date.now() - startTime
        });
        
        return NextResponse.json({
          text: noResultsText,
        });
      }
    } else if (parsedResponse.type === "category_search" && parsedResponse.category) {
      const categoryQuery = parsedResponse.category;
      const products = await searchProductsByCategory(categoryQuery);
      
      if (products && products.length > 0) {
        const formattedProducts: Product[] = products.map((p) => ({
          ...p,
          category: Array.isArray(p.category) ? p.category[0] : p.category,
        })) as Product[];

        let responseText = `"${categoryQuery}" ক্যাটাগরিতে ${formattedProducts.length}টি পণ্য পেয়েছি:`;
        responseText += ` বিস্তারিত দেখতে যেকোনো পণ্যে ক্লিক করুন।`;

        // Log the conversation
        await logChatConversation({
          sessionId: finalSessionId,
          userMessage: message,
          aiResponse: responseText,
          responseType: 'category_search',
          userIp,
          userAgent,
          productsReturned: formattedProducts,
          conversationContext: { category: categoryQuery },
          responseTimeMs: Date.now() - startTime
        });

        return NextResponse.json({
          text: responseText,
          products: formattedProducts,
        });
      } else {
        const noResultsText = `"${categoryQuery}" ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি। অন্য ক্যাটাগরি দেখুন।`;
        
        // Log the conversation
        await logChatConversation({
          sessionId: finalSessionId,
          userMessage: message,
          aiResponse: noResultsText,
          responseType: 'category_search',
          userIp,
          userAgent,
          productsReturned: [],
          conversationContext: { category: categoryQuery },
          responseTimeMs: Date.now() - startTime
        });
        
        return NextResponse.json({
          text: noResultsText,
        });
      }
    } else if (parsedResponse.type === "recommendations") {
      const products = await getPersonalizedRecommendations();
      if (products.length > 0) {
        const formattedProducts: Product[] = products.map((p) => ({
          ...p,
          category: Array.isArray(p.category) ? p.category[0] : p.category,
        })) as Product[];

        const recommendationsText = "আমাদের বিশেষভাবে নির্বাচিত পণ্যসমূহ যা আপনার পছন্দ হতে পারে:";
        
        // Log the conversation
        await logChatConversation({
          sessionId: finalSessionId,
          userMessage: message,
          aiResponse: recommendationsText,
          responseType: 'recommendations',
          userIp,
          userAgent,
          productsReturned: formattedProducts,
          conversationContext: {},
          responseTimeMs: Date.now() - startTime
        });
        
        return NextResponse.json({
          text: recommendationsText,
          products: formattedProducts,
        });
      } else {
        const noRecommendationsText = "এই মুহূর্তে কোনো বিশেষ সুপারিশ নেই। আমাদের পণ্যের তালিকা দেখুন।";
        
        // Log the conversation
        await logChatConversation({
          sessionId: finalSessionId,
          userMessage: message,
          aiResponse: noRecommendationsText,
          responseType: 'recommendations',
          userIp,
          userAgent,
          productsReturned: [],
          conversationContext: {},
          responseTimeMs: Date.now() - startTime
        });
        
        return NextResponse.json({
          text: noRecommendationsText,
        });
      }
    } else if (parsedResponse.type === "flash_sale") {
      const products = await getFlashSaleItems();
      if (products.length > 0) {
        const formattedProducts: Product[] = products.map((p) => ({
          ...p,
          category: Array.isArray(p.category) ? p.category[0] : p.category,
        })) as Product[];

        const flashSaleText = "🔥 চলমান ফ্ল্যাশ সেল! সীমিত সময়ের জন্য বিশেষ ছাড়:";
        
        // Log the conversation
        await logChatConversation({
          sessionId: finalSessionId,
          userMessage: message,
          aiResponse: flashSaleText,
          responseType: 'flash_sale',
          userIp,
          userAgent,
          productsReturned: formattedProducts,
          conversationContext: {},
          responseTimeMs: Date.now() - startTime
        });
        
        return NextResponse.json({
          text: flashSaleText,
          products: formattedProducts,
        });
      } else {
        const noFlashSaleText = "এই মুহূর্তে কোনো ফ্ল্যাশ সেল চালু নেই। শীঘ্রই নতুন অফার আসছে!";
        
        // Log the conversation
        await logChatConversation({
          sessionId: finalSessionId,
          userMessage: message,
          aiResponse: noFlashSaleText,
          responseType: 'flash_sale',
          userIp,
          userAgent,
          productsReturned: [],
          conversationContext: {},
          responseTimeMs: Date.now() - startTime
        });
        
        return NextResponse.json({
          text: noFlashSaleText,
        });
      }
    } else if (parsedResponse.type === "order_tracking") {
      const orderTrackingText = parsedResponse.message || "অর্ডার ট্র্যাক করতে আপনার অর্ডার নম্বর এবং ফোন নম্বর দিন।";
      
      // Log the conversation
      await logChatConversation({
        sessionId: finalSessionId,
        userMessage: message,
        aiResponse: orderTrackingText,
        responseType: 'order_tracking',
        userIp,
        userAgent,
        productsReturned: [],
        conversationContext: {},
        responseTimeMs: Date.now() - startTime
      });
      
      return NextResponse.json({
        text: orderTrackingText,
      });
    } else if (parsedResponse.type === "text" && parsedResponse.message) {
      // Log the conversation
      await logChatConversation({
        sessionId: finalSessionId,
        userMessage: message,
        aiResponse: parsedResponse.message,
        responseType: 'text',
        userIp,
        userAgent,
        productsReturned: [],
        conversationContext: {},
        responseTimeMs: Date.now() - startTime
      });
      
      return NextResponse.json({ text: parsedResponse.message });
    } else {
      const fallbackText = "দুঃখিত, আমি বুঝতে পারলাম না। আবার বলুন তো?";
      
      // Log the conversation
      await logChatConversation({
        sessionId: finalSessionId,
        userMessage: message,
        aiResponse: fallbackText,
        responseType: 'fallback',
        userIp,
        userAgent,
        productsReturned: [],
        conversationContext: {},
        responseTimeMs: Date.now() - startTime
      });
      
      return NextResponse.json({
        text: fallbackText,
      });
    }
  } catch (error) {
    console.error("Error generating content or processing response:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
