import type { CartItem, PaymentMethodKey } from "@/types";

export type CheckoutInput = {
  email: string;
  fullName: string;
  items: CartItem[];
  totalCents: number;
  method: PaymentMethodKey;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutResult = {
  externalPaymentId: string;
  // Hosted checkout URL (Stripe) OR null (PIX inline flow)
  redirectUrl?: string;
  // PIX-specific
  pixCode?: string;
  pixQrCodeUrl?: string;
  expiresAt?: string;
};

export type WebhookEvent = {
  type: "payment.paid" | "payment.failed" | "payment.expired" | "payment.refunded";
  externalPaymentId: string;
  orderId: string;
  rawPayload: unknown;
};

export interface PaymentProvider {
  name: "abacate" | "stripe";
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent>;
  getPaymentStatus(externalPaymentId: string): Promise<WebhookEvent["type"]>;
}
