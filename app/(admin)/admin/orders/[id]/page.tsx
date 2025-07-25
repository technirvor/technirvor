import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";
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
    .from("tracking_notes")
    .select("*")
    .eq("order_id", orderId);
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

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="mb-4">
        <span className="font-semibold">Order ID:</span> {order.id}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Customer:</span> {order.customer_name}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Total Amount:</span> $
        {order.total_amount}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Status:</span> {order.status}
      </div>
      <h2 className="text-xl font-semibold mt-6 mb-2">Items</h2>
      <ul className="list-disc pl-6">
        {order.items?.map((item: any) => (
          <li key={item.id}>
            {item.product?.name} x {item.quantity} (${item.product?.price})
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Tracking Notes</h2>
      <ul className="list-disc pl-6">
        {trackingNotes.map((note: any) => (
          <li key={note.id}>{note.note}</li>
        ))}
      </ul>
    </main>
  );
}
