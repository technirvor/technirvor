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
    .select(
      `
      id, name, slug, price, sale_price, image_url, stock,
      is_featured, is_flash_sale, flash_sale_end, created_at,
      category:categories(id, name, slug)
    `,
    )
    .eq("is_featured", true)
    .gt("stock", 0)
    .limit(4);
  return products || [];
};

const getFlashSaleItems = async () => {
  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, price, sale_price, image_url, stock,
      is_featured, is_flash_sale, flash_sale_end, created_at,
      category:categories(id, name, slug)
    `,
    )
    .eq("is_flash_sale", true)
    .gt("stock", 0)
    .gte("flash_sale_end", new Date().toISOString())
    .limit(6);
  return products || [];
};

const searchProductsByCategory = async (category: string) => {
  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, price, sale_price, image_url, stock,
      is_featured, is_flash_sale, flash_sale_end, created_at,
      category:categories(id, name, slug)
    `,
    )
    .or(`category.name.ilike.%${category}%`)
    .gt("stock", 0)
    .limit(6);
  return products || [];
};

export async function POST(req: NextRequest) {
  const { history, message } = await req.json();

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig,
    systemInstruction: `আপনি Tech Nirvor (টেক নির্ভর) টিমের তৈরি একটি উন্নত এজেন্ট AI, যার নাম Tech Sahayak (টেক সহায়ক)। আপনি একটি বুদ্ধিমান শপিং সহায়ক যিনি ব্যবহারকারীদের সাথে প্রাকৃতিক কথোপকথনের মাধ্যমে তাদের চাহিদা বুঝে নিয়ে সর্বোত্তম পণ্য সুপারিশ করেন।

**আপনার মূল ক্ষমতাসমূহ:**
1. **স্মার্ট পণ্য অনুসন্ধান**: ব্যবহারকারীর প্রয়োজন অনুযায়ী পণ্য খুঁজে দেওয়া
2. **ব্যক্তিগতকৃত সুপারিশ**: ব্যবহারকারীর পছন্দ ও বাজেট অনুযায়ী পণ্য সুপারিশ
3. **অর্ডার ট্র্যাকিং**: অর্ডারের অবস্থা জানানো
4. **ফ্ল্যাশ সেল আপডেট**: বিশেষ অফার ও ছাড়ের তথ্য প্রদান
5. **তুলনামূলক বিশ্লেষণ**: একাধিক পণ্যের মধ্যে তুলনা করে সাহায্য

**কথোপকথনের নিয়মাবলী:**
- সর্বদা বন্ধুত্বপূর্ণ ও সহায়ক থাকুন
- ব্যবহারকারীর ভাষা (বাংলা/ইংরেজি/বাংলিশ) অনুসরণ করুন
- প্রয়োজনে প্রশ্ন করে ব্যবহারকারীর চাহিদা স্পষ্ট করুন
- পণ্যের বৈশিষ্ট্য, দাম ও সুবিধা সম্পর্কে বিস্তারিত তথ্য দিন

**প্রতিক্রিয়ার ধরন ও ফরম্যাট:**

1. **পণ্য অনুসন্ধানের জন্য:**
   {
     "type": "product_search",
     "query": "product name or category",
     "intent": "search" | "category" | "price_range"
   }

2. **সুপারিশের জন্য:**
   {
     "type": "recommendations",
     "category": "featured" | "flash_sale" | "category_specific"
   }

3. **ফ্ল্যাশ সেল আইটেমের জন্য:**
   {
     "type": "flash_sale"
   }

4. **অর্ডার ট্র্যাকিংয়ের জন্য:**
   {
     "type": "order_tracking",
     "message": "Please provide your order number and phone number"
   }

5. **সাধারণ কথোপকথনের জন্য:**
   {
     "type": "text",
     "message": "Your helpful response here"
   }

**উদাহরণ:**
- "ল্যাপটপ দেখান" → {"type": "product_search", "query": "laptop", "intent": "search"}
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
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    let parsedResponse: { type: string; query?: string; message?: string };
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", text, parseError);
      return NextResponse.json(
        { text: "Sorry, I received an unreadable response from the AI." },
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
        return NextResponse.json(
          {
            text: "দুঃখিত, এই মুহূর্তে পণ্য খুঁজে পাচ্ছি না। আবার চেষ্টা করুন।",
          },
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

        return NextResponse.json({
          text: responseText,
          products: formattedProducts,
        });
      } else {
        return NextResponse.json({
          text: `"${searchQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি। অন্য কিছু খুঁজে দেখুন।`,
        });
      }
    } else if (parsedResponse.type === "recommendations") {
      const products = await getPersonalizedRecommendations();
      if (products.length > 0) {
        const formattedProducts: Product[] = products.map((p) => ({
          ...p,
          category: Array.isArray(p.category) ? p.category[0] : p.category,
        })) as Product[];

        return NextResponse.json({
          text: "আমাদের বিশেষভাবে নির্বাচিত পণ্যসমূহ যা আপনার পছন্দ হতে পারে:",
          products: formattedProducts,
        });
      } else {
        return NextResponse.json({
          text: "এই মুহূর্তে কোনো বিশেষ সুপারিশ নেই। আমাদের পণ্যের তালিকা দেখুন।",
        });
      }
    } else if (parsedResponse.type === "flash_sale") {
      const products = await getFlashSaleItems();
      if (products.length > 0) {
        const formattedProducts: Product[] = products.map((p) => ({
          ...p,
          category: Array.isArray(p.category) ? p.category[0] : p.category,
        })) as Product[];

        return NextResponse.json({
          text: "🔥 চলমান ফ্ল্যাশ সেল! সীমিত সময়ের জন্য বিশেষ ছাড়:",
          products: formattedProducts,
        });
      } else {
        return NextResponse.json({
          text: "এই মুহূর্তে কোনো ফ্ল্যাশ সেল চালু নেই। শীঘ্রই নতুন অফার আসছে!",
        });
      }
    } else if (parsedResponse.type === "order_tracking") {
      return NextResponse.json({
        text:
          parsedResponse.message ||
          "অর্ডার ট্র্যাক করতে আপনার অর্ডার নম্বর এবং ফোন নম্বর দিন।",
      });
    } else if (parsedResponse.type === "text" && parsedResponse.message) {
      return NextResponse.json({ text: parsedResponse.message });
    } else {
      return NextResponse.json({
        text: "দুঃখিত, আমি বুঝতে পারলাম না। আবার বলুন তো?",
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
