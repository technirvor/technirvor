import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import InvoicePrint from "./invoice-print";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

async function getOrder(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        payment_status,
        items:order_items(
          *,
          product:products(*)
        ),
        tracking_notes(*)
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

export default async function InvoicePage({ params }: Props) {
  // Await params if it's a Promise (Next.js dynamic route compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  const order = await getOrder(resolvedParams.id);

  if (!order) {
    notFound();
  }

  return <InvoicePrint order={order} />;
}
