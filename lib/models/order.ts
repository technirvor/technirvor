import mongoose, { Schema, models } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image?: string; // Made optional
  price: number;
  quantity: number;
  slug: string;
}

export interface IShippingAddress {
  fullName: string;
  email?: string;
  address: string;
  phone?: string;
  city?: string; // Made optional
  district: string;
  postalCode?: string;
  country?: string;
}

export interface IOrder {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | string; // Made optional
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: false }, // Made optional
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  slug: { type: String, required: true },
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  fullName: { type: String, required: true },
  email: { type: String, required: false },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: false }, // Made optional
  district: { type: String, required: true },
  postalCode: { type: String, required: false },
  country: { type: String, required: false, default: "Bangladesh" },
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false }, // Made optional
    orderItems: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Static method to create an order
orderSchema.statics.createOrder = async function (orderData: Omit<IOrder, "_id" | "createdAt" | "updatedAt">) {
  const newOrder = new this(orderData);
  return newOrder.save();
};

const OrderModel = (models.Order as mongoose.Model<IOrder>) || mongoose.model<IOrder>("Order", orderSchema);

export default OrderModel;