import type { PaymentProvider, CheckoutInput, CheckoutResult, WebhookEvent } from "./types";
import { env } from "@/lib/env";

// Skeleton — fill request bodies once Abacate Pay account is provisioned.
// Docs: https://docs.abacatepay.com/

export const AbacatePayProvider: PaymentProvider = {
  name: "abacate",

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (!env.ABACATE_API_KEY) {
      throw new Error("ABACATE_API_KEY missing");
    }
    const res = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.ABACATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        frequency: "ONE_TIME",
        methods: ["PIX"],
        products: input.items.map((i) => ({
          externalId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.priceCents,
        })),
        returnUrl: input.successUrl,
        completionUrl: input.successUrl,
        customer: {
          name: input.fullName,
          email: input.email,
        },
        externalId: input.orderId,
      }),
    });
    if (!res.ok) {
      throw new Error(`Abacate createCheckout failed: ${res.status}`);
    }
    const data = (await res.json()) as {
      data: { id: string; url?: string; brCode?: string; brCodeBase64?: string; expiresAt?: string };
    };
    return {
      externalPaymentId: data.data.id,
      redirectUrl: data.data.url,
      pixCode: data.data.brCode,
      pixQrCodeUrl: data.data.brCodeBase64,
      expiresAt: data.data.expiresAt,
    };
  },

  async verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent> {
    if (!env.ABACATE_WEBHOOK_SECRET) {
      throw new Error("ABACATE_WEBHOOK_SECRET missing");
    }
    // Abacate uses query-param `webhookSecret`. Caller passes it via `signature`.
    if (signature !== env.ABACATE_WEBHOOK_SECRET) {
      throw new Error("Invalid webhook secret");
    }
    const payload = JSON.parse(rawBody) as {
      event: string;
      data: { billing: { id: string; externalId: string; status: string } };
    };
    const status = payload.data.billing.status;
    const map: Record<string, WebhookEvent["type"]> = {
      PAID: "payment.paid",
      EXPIRED: "payment.expired",
      CANCELLED: "payment.failed",
      REFUNDED: "payment.refunded",
    };
    return {
      type: map[status] ?? "payment.failed",
      externalPaymentId: payload.data.billing.id,
      orderId: payload.data.billing.externalId,
      rawPayload: payload,
    };
  },

  async getPaymentStatus(externalPaymentId: string): Promise<WebhookEvent["type"]> {
    if (!env.ABACATE_API_KEY) throw new Error("ABACATE_API_KEY missing");
    const res = await fetch(`https://api.abacatepay.com/v1/billing/${externalPaymentId}`, {
      headers: { Authorization: `Bearer ${env.ABACATE_API_KEY}` },
    });
    if (!res.ok) throw new Error(`Abacate getPaymentStatus failed: ${res.status}`);
    const data = (await res.json()) as { data: { status: string } };
    const map: Record<string, WebhookEvent["type"]> = {
      PAID: "payment.paid",
      EXPIRED: "payment.expired",
      CANCELLED: "payment.failed",
      REFUNDED: "payment.refunded",
    };
    return map[data.data.status] ?? "payment.failed";
  },
};
