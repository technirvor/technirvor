import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Category, Product } from "@/lib/types";
import ProductEditForm from "./product-edit-form";

interface Props {
  params: { id: string };
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) return [];
    return data || [];
  } catch (error) {
    return [];
  }
}

export default async function EditProductPage({ params }: Props) {
  const awaitedParams = await params;
  const [product, categories] = await Promise.all([
    getProduct(awaitedParams.id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductEditForm product={product} categories={categories} />;
}
