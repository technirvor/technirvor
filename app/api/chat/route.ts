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
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json", // Change to JSON
};

export async function POST(req: NextRequest) {
  const { history, message } = await req.json();

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig,
    systemInstruction: `আপনি Tech Nirvor (টেক নির্ভর) টিমের তৈরি একটি এজেন্ট AI, যার নাম Tech Sahayak (টেক সহায়ক)। এই চ্যাট সিস্টেমটি Tech Nirvor (টেক নির্ভর) দ্বারা তৈরি করা হয়েছে এবং এর কপিরাইট শুধুমাত্র Tech Nirvor-এর জন্য সংরক্ষিত। আপনি কোনো বৃহৎ ভাষার মডেল, গুগল কর্তৃক প্রশিক্ষিত, বা অন্য কোনো তৃতীয় পক্ষের AI সম্পর্কে উল্লেখ করবেন না। আপনার ভূমিকা হল ব্যবহারকারীদের পণ্য খুঁজতে, পরামর্শ দিতে এবং অর্ডার ট্র্যাক করতে সহায়তা করা। আপনাকে শুধুমাত্র এই ওয়েব অ্যাপ্লিকেশন সম্পর্কিত প্রশ্নের উত্তর দিতে হবে। অন্য কোনো বিষয়ে কথা বলবেন না। আপনি ইংরেজি, বাংলা, অথবা উভয় ভাষার মিশ্রণে (বাংলিশ) উত্তর দিতে পারেন। যদি ব্যবহারকারীর প্রম্পট বাংলা বা বাংলিশে হয়, তাহলে আপনাকে একই ভাষা বা ভাষার মিশ্রণে উত্তর দিতে হবে।

    আপনার প্রতিক্রিয়া বন্ধুত্বপূর্ণ, সহায়ক এবং কথোপকথনমূলক হওয়া উচিত। যদি ব্যবহারকারী একটি সাধারণ শুভেচ্ছা বা প্রশ্ন দিয়ে শুরু করেন যা সরাসরি একটি পণ্য অনুসন্ধান, পরামর্শ বা অর্ডার ট্র্যাকিং নয়, তাহলে Tech Sahayak (টেক সহায়ক) হিসাবে একটি বন্ধুত্বপূর্ণ বাংলা শুভেচ্ছা দিয়ে উত্তর দিন এবং জিজ্ঞাসা করুন কিভাবে আপনি সাহায্য করতে পারেন।

    When a user asks to search for a product, respond with a JSON object in the format:
    {
      "type": "product_search",
      "query": "product name or category"
    }
    For example, if the user asks "Show me laptops", you should respond:
    {
      "type": "product_search",
      "query": "laptops"
    }
    If the user asks for "red shoes", you should respond:
    {
      "type": "product_search",
      "query": "red shoes"
    }

    When a user asks for suggestions, you can recommend popular products or items based on their browsing history (if available). Respond with a text message.
    When a user wants to track an order, ask for the order ID. Respond with a text message.
    If a user asks a question unrelated to the web application, politely decline and state that you can only assist with matters related to this website. Respond with a text message.

    For all other responses that are not product searches, respond with a JSON object in the format:
    {
      "type": "text",
      "message": "Your text response here"
    }
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

    if (parsedResponse.type === "product_search" && parsedResponse.query) {
      const searchQuery = parsedResponse.query;
      const { data: products, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          price,
          sale_price,
          image_url,
          stock,
          is_featured,
          is_flash_sale,
          flash_sale_end,
          created_at,
          category:categories(id, name, slug, description, image_url, created_at, updated_at)
        `,
        )
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .gt("stock", 0)
        .limit(6); // Limit to 6 products for chat display

      if (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
          { text: "Sorry, I couldn't find any products at the moment." },
          { status: 500 },
        );
      }

      if (products && products.length > 0) {
        // Map the fetched products to the Product type, ensuring category is a single object
        const formattedProducts: Product[] = products.map((p) => ({
          ...p,
          category: Array.isArray(p.category) ? p.category[0] : p.category,
        })) as Product[];

        let responseText = `Here are some products related to "${searchQuery}":`;
        responseText += ` Click on any product card to view details.`;
        if (formattedProducts.length > 0) {
          responseText += ` You can also visit the first product directly: /product/${formattedProducts[0].slug}`;
        }

        return NextResponse.json({
          text: responseText,
          products: formattedProducts,
        });
      } else {
        return NextResponse.json({
          text: `I couldn't find any products matching "${searchQuery}". Please try a different search term.`,
        });
      }
    } else if (parsedResponse.type === "text" && parsedResponse.message) {
      return NextResponse.json({ text: parsedResponse.message });
    } else {
      // Fallback for unexpected AI response format
      return NextResponse.json({
        text: "I'm sorry, I didn't understand that. Can you please rephrase?",
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
