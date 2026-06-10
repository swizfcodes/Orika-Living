import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  type: z.enum([
    "Retail / Stockist Partnership",
    "Bulk / Wholesale Order",
    "Corporate Gifting",
    "Hotel / Hospitality Placement",
    "Event Setup",
    "General Enquiry",
  ]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const deliveryAddressSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
});

// Payment methods the storefront can initiate. Mirrors the values the
// hub accepts on POST /store/orders (body.payment_method).
export const paymentMethodSchema = z.enum(["paystack", "optimus_pay"]);

export const checkoutSchema = z.object({
  delivery_address: deliveryAddressSchema,
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Cart is empty")
    .max(50, "Too many items in cart"),
  // Optional — defaults to "paystack" on the backend when omitted.
  payment_method: paymentMethodSchema.optional(),
});

// Server-side cap on the total order amount (in kobo). Defensive bound so a
// pricing bug or malformed product row can't push a huge amount to Paystack.
// ₦10,000,000 = 1,000,000,000 kobo.
export const MAX_ORDER_KOBO = 1_000_000_000;

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  scent_family: z.string(),
  format: z.string(),
  price_kobo: z.number().int().min(100),
  size_ml: z.number().int().min(1),
  stock_qty: z.number().int().min(0),
  description: z.string().min(10),
  top_notes: z.array(z.string()),
  heart_notes: z.array(z.string()),
  base_notes: z.array(z.string()),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type DeliveryAddressInput = z.infer<typeof deliveryAddressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
