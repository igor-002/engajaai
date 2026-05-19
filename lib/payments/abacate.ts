import crypto from "node:crypto";
import type {
  PaymentProvider,
  CheckoutInput,
  CheckoutResult,
  PixQrCodeResult,
  WebhookEvent,
  WebhookVerifyContext,
  PaymentStatus,
} from "./types";
import { env } from "@/lib/env";
import { normalizeCpf, normalizeCellphone } from "@/lib/payments/customer";

const BASE_URL = "https://api.abacatepay.com/v2";

const STATUS_FROM_EVENT: Record<string, WebhookEvent["type"]> = {
  "billing.paid": "paid",
  "billing.refunded": "refunded",
  "billing.expired": "expired",
  "billing.failed": "failed",
  "billing.cancelled": "failed",
  "pixQrCode.paid": "paid",
  "pixQrCode.refunded": "refunded",
  "pixQrCode.expired": "expired",
  "pixQrCode.failed": "failed",
  "pixQrCode.cancelled": "failed",
  "checkout.completed": "paid",
  "checkout.refunded": "refunded",
  "checkout.disputed": "failed",
  "checkout.expired": "expired",
  "checkout.cancelled": "failed",
  "transparent.completed": "paid",
  "transparent.refunded": "refunded",
  "transparent.disputed": "failed",
  "transparent.expired": "expired",
  "transparent.cancelled": "failed",
};

const STATUS_FROM_TRANSPARENT_STATUS: Record<string, PaymentStatus> = {
  PENDING: "pending",
  PAID: "paid",
  COMPLETE: "paid",
  EXPIRED: "expired",
  CANCELLED: "failed",
  REFUNDED: "refunded",
};

function authHeaders(): HeadersInit {
  if (!env.ABACATE_API_KEY) throw new Error("ABACATE_API_KEY missing");
  return {
    Authorization: `Bearer ${env.ABACATE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

function buildCustomer(input: CheckoutInput) {
  return {
    name: input.fullName,
    email: input.email,
    taxId: normalizeCpf(input.taxId),
    cellphone: normalizeCellphone(input.cellphone),
  };
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

type WebhookData = {
  id?: string;
  transparent?: { id?: string; externalId?: string; metadata?: { orderId?: string } };
  checkout?: { id?: string; externalId?: string; metadata?: { orderId?: string } };
  billing?: { id?: string; externalId?: string; metadata?: { orderId?: string } };
  pixQrCode?: { id?: string; externalId?: string; metadata?: { orderId?: string } };
  externalId?: string;
  metadata?: { orderId?: string };
};

function extractIds(data: WebhookData) {
  const node = data.transparent ?? data.checkout ?? data.billing ?? data.pixQrCode;
  const externalPaymentId = node?.id ?? data.id ?? "";
  const orderId =
    node?.metadata?.orderId ??
    data.metadata?.orderId ??
    node?.externalId ??
    data.externalId ??
    "";
  return { externalPaymentId, orderId };
}

export const AbacatePayProvider: PaymentProvider = {
  name: "abacate",

  async createCheckout(_input: CheckoutInput): Promise<CheckoutResult> {
    throw new Error(
      "Fluxo de cartão (Abacate /checkouts/create v2) requer produtos pré-cadastrados em /products/create. Não implementado.",
    );
  },

  async createPixQrCode(input: CheckoutInput): Promise<PixQrCodeResult> {
    const res = await fetch(`${BASE_URL}/transparents/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        method: "PIX",
        data: {
          amount: input.totalCents,
          expiresIn: 3600,
          description: input.description ?? `Pedido ${input.orderId}`,
          customer: buildCustomer(input),
          externalId: input.orderId,
          metadata: { orderId: input.orderId },
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Abacate transparents/create failed: ${res.status} ${text}`);
    }
    const payload = (await res.json()) as {
      data: { id: string; brCode: string; brCodeBase64: string; expiresAt?: string };
      error: unknown;
    };
    if (!payload.data?.id || !payload.data?.brCode) {
      throw new Error("Abacate transparents/create: malformed response");
    }
    return {
      externalPaymentId: payload.data.id,
      pixCode: payload.data.brCode,
      pixQrCodeUrl: payload.data.brCodeBase64,
      expiresAt: payload.data.expiresAt,
    };
  },

  async verifyWebhook(ctx: WebhookVerifyContext): Promise<WebhookEvent> {
    if (!env.ABACATE_WEBHOOK_SECRET) throw new Error("ABACATE_WEBHOOK_SECRET missing");

    if (env.ABACATE_WEBHOOK_URL_SECRET) {
      const provided = ctx.query.get("webhookSecret") ?? "";
      if (!timingSafeEqualStr(provided, env.ABACATE_WEBHOOK_URL_SECRET)) {
        throw new Error("Invalid webhook URL secret");
      }
    }

    const providedSecret = ctx.headers.get("x-webhook-secret") ?? ctx.headers.get("X-Webhook-Secret");
    const sig = ctx.headers.get("x-webhook-signature") ?? ctx.headers.get("X-Webhook-Signature");

    let verified = false;
    if (providedSecret) {
      verified = timingSafeEqualStr(providedSecret, env.ABACATE_WEBHOOK_SECRET);
    }
    if (!verified && sig) {
      const expectedHex = crypto
        .createHmac("sha256", env.ABACATE_WEBHOOK_SECRET)
        .update(ctx.rawBody)
        .digest("hex");
      const expectedB64 = crypto
        .createHmac("sha256", env.ABACATE_WEBHOOK_SECRET)
        .update(ctx.rawBody)
        .digest("base64");
      const provided = sig.replace(/^sha256=/, "").trim();
      verified = timingSafeEqualStr(provided, expectedHex) || timingSafeEqualStr(provided, expectedB64);
    }
    if (!verified) {
      throw new Error("Invalid webhook secret/signature");
    }

    const payload = JSON.parse(ctx.rawBody) as {
      id?: string;
      event: string;
      apiVersion?: number;
      devMode?: boolean;
      data: WebhookData;
    };

    const eventName = payload.event;
    const status = STATUS_FROM_EVENT[eventName];
    if (!status) throw new Error(`Unknown Abacate event: ${eventName}`);

    const { externalPaymentId, orderId } = extractIds(payload.data);
    if (!externalPaymentId || !orderId) {
      throw new Error("Webhook payload missing ids");
    }

    return {
      id: payload.id ?? `evt_${externalPaymentId}_${eventName}_${Date.now()}`,
      type: status,
      rawEvent: eventName,
      externalPaymentId,
      orderId,
      devMode: payload.devMode ?? false,
      rawPayload: payload,
    };
  },

  async getPaymentStatus(externalPaymentId, kind): Promise<PaymentStatus> {
    if (kind === "pix") {
      const res = await fetch(
        `${BASE_URL}/transparents/check?id=${encodeURIComponent(externalPaymentId)}`,
        { headers: authHeaders() },
      );
      if (!res.ok) throw new Error(`transparents/check failed: ${res.status}`);
      const payload = (await res.json()) as { data: { status: string } };
      return STATUS_FROM_TRANSPARENT_STATUS[payload.data.status] ?? "pending";
    }
    return "pending";
  },
};
