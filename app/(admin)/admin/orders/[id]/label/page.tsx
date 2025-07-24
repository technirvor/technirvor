import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/types';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/print-button';
import OrderLabel from './order-label';

interface Props {
  params: { id: string };
}

async function getOrder(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `,
      )
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
}

export default async function OrderLabelPage({ params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const order = await getOrder(resolvedParams.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-gray-900">Order Label</h1>
          <PrintButton targetId="order-label-content" label="Print Label" />
        </div>
        <div id="order-label-content">
          <OrderLabel order={order} />
        </div>
      </div>
    </div>
  );
}
