import { Separator } from "@/components/ui/separator";

interface OrderLabelProps {
  order: any; // Use your Order type if available
}

export default function OrderLabel({ order }: OrderLabelProps) {
  return (
    <div
      id="order-label-content"
      className="bg-white rounded-xl shadow p-8 border border-gray-200 print:border print:shadow-none print:rounded-none print:p-6"
    >
      {/* Branding/Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 text-xl print:hidden">
            TN
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-blue-700 tracking-wide">
              Tech Nirvor
            </h2>
            <p className="text-xs text-gray-500">123 Business Street, Dhaka</p>
            <p className="text-xs text-gray-500">+880 1234-567890</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Order ID:</span>
          <div className="font-mono text-base text-gray-800 font-bold">
            {order.id.slice(0, 8).toUpperCase()}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(order.created_at).toLocaleDateString("en-GB")}
          </div>
        </div>
      </div>
      <Separator className="my-4" />
      {/* Recipient */}
      <div className="mb-6">
        <div className="font-semibold text-gray-900 mb-1">Recipient</div>
        <div className="text-gray-900 text-base font-bold">
          {order.customer_name}
        </div>
        <div className="text-gray-700 text-sm">{order.customer_phone}</div>
        <div className="text-gray-700 text-sm">{order.address}</div>
        <div className="text-gray-700 text-sm">{order.district}</div>
      </div>
      <Separator className="my-4" />
      {/* Items */}
      <div>
        <div className="font-semibold text-gray-900 mb-2">Items</div>
        <ul className="list-none pl-0 text-gray-800 text-sm">
          {order.items.map((item: any) => (
            <li
              key={item.id}
              className="flex justify-between border-b border-dashed border-gray-200 py-1"
            >
              <span>{item.product?.name || item.name}</span>
              <span className="font-bold">x {item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Footer/Note */}
      <div className="mt-8 text-xs text-gray-400 text-center print:mt-4">
        <span>Thank you for shopping with Tech Nirvor!</span>
      </div>
    </div>
  );
}
