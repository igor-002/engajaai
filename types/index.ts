export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  originalPriceCents?: number;
  imageUrl?: string;
  categorySlug: string;
  stock: number;
  paymentMethods: PaymentMethodKey[];
  deliveryMode: "auto" | "manual";
  featured?: boolean;
};

export type PaymentMethodKey = "pix" | "card";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string;
};

export type Order = {
  id: string;
  userId: string | null;
  email: string;
  fullName: string;
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  paymentProvider: "abacate" | "stripe";
  paymentMethod: PaymentMethodKey;
  status: "pending" | "paid" | "failed" | "expired" | "refunded";
  externalPaymentId?: string;
  pixCode?: string;
  pixQrCodeUrl?: string;
  createdAt: string;
};
