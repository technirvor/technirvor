export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  images?: string[];
  image_sizes?: { [key: string]: string };
  category_id?: string;
  subcategory_id?: string;
  category?: { name: string } | Category; // Allow partial category for product search
  subcategory?: { name: string; slug: string };
  stock: number;
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_end?: string;
  has_free_delivery?: boolean;
  free_delivery_note?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  isCombo?: boolean;
  comboId?: string;
  comboName?: string;
  comboPrice?: number;
  comboItems?: ComboProductItem[];
}

export interface Order {
  order_number: any;
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  district: string;
  address: string;
  shipping_address?: string;
  payment_method: string;
  total_amount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  items: OrderItem[];
  tracking_notes: TrackingNote[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface TrackingNote {
  id: string;
  order_id: string;
  note: string;
  status: string;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  order_index: number;
}

export interface District {
  id: string;
  name: string;
  delivery_charge: number;
}

export interface ComboProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  combo_price: number;
  original_price: number;
  image_url?: string;
  is_active: boolean;
  items: ComboProductItem[];
  created_at: string;
}

export interface ComboProductItem {
  id: string;
  combo_id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export interface AdminNotification {
  id: string;
  type: "new_order" | "order_update" | "low_stock" | "system";
  title: string;
  message: string;
  order_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImageUploadResult {
  publicUrl: string;
  path: string;
  fullPath: string;
}

export interface StockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
}

// Re-export user types
export * from './types/user';
