import type { CartItem, PaymentMethodKey } from "@/types";

export type CheckoutInput = {
  email: string;
  fullName: string;
  taxId: string;
  cellphone: string;
  items: CartItem[];
  totalCents: number;
  orderId: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutResult = {
  externalPaymentId: string;
  redirectUrl: string;
};

export type PixQrCodeResult = {
  externalPaymentId: string;
  pixCode: string;
  pixQrCodeUrl: string;
  expiresAt?: string;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded";

export type WebhookEvent = {
  id: string;
  type: Exclude<PaymentStatus, "pending">;
  rawEvent: string;
  externalPaymentId: string;
  orderId: string;
  devMode: boolean;
  rawPayload: unknown;
};

export type WebhookVerifyContext = {
  rawBody: string;
  headers: Headers;
  query: URLSearchParams;
};

export interface PaymentProvider {
  name: "abacate" | "stripe";
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  createPixQrCode(input: CheckoutInput): Promise<PixQrCodeResult>;
  verifyWebhook(ctx: WebhookVerifyContext): Promise<WebhookEvent>;
  getPaymentStatus(externalPaymentId: string, kind: PaymentMethodKey): Promise<PaymentStatus>;
}
