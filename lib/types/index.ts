import type { ScentFamily } from "@/lib/constants/scent-families";
export type { ScentFamily };

export type ProductFormat =
  | "Grand Edition"
  | "Signature Edition"
  | "Curated Gift Set"
  | "Car Diffuser";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type EnquiryType =
  | "Retail / Stockist Partnership"
  | "Bulk / Wholesale Order"
  | "Corporate Gifting"
  | "Hotel / Hospitality Placement"
  | "Event Setup"
  | "General Enquiry";

export type EnquiryStatus = "new" | "read" | "replied" | "closed";

export interface Product {
  id: string;
  name: string;
  slug: string;
  scent_family: ScentFamily;
  format: ProductFormat;
  price_kobo: number;
  size_ml: number;
  stock_qty: number;
  in_stock: boolean;
  images: string[];
  description: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price_kobo: number;
  quantity: number;
  image: string;
  size_ml: number;
  format: ProductFormat;
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_kobo: number;
  paystack_ref: string;
  delivery_address: DeliveryAddress;
  items: CartItem[];
  created_at: string;
}

export interface DeliveryAddress {
  full_name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: EnquiryType;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  total_orders: number;
  created_at: string;
}

// Utility: convert kobo to naira for display
export const fromKobo = (kobo: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
};

// Utility: convert naira to kobo for storage
export const toKobo = (naira: number): number => Math.round(naira * 100);
