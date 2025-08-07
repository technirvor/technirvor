import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import { notFound } from "next/navigation";
import OrderDetailsClient from "./OrderDetailsClient";

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
        transaction_id,
        payment_status,
        items:order_items(
          *,
          product:products(*)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return null;
    }
    if (!data) {
      console.warn("No order found for id:", id);
    }
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

async function getTrackingNotes(orderId: string) {
  const { data, error } = await supabase
    .from("order_tracking")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Tracking notes error:", error);
    return [];
  }
  return data || [];
}

export default async function OrderDetailsPage({ params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const order = await getOrder(resolvedParams.id);
  const trackingNotes = order ? await getTrackingNotes(order.id) : [];

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600">
          The order with ID{" "}
          <span className="font-mono">{resolvedParams.id}</span> does not exist.
        </p>
      </main>
    );
  }

  return <OrderDetailsClient order={order} trackingNotes={trackingNotes} />;
}
