import type {
  PaymentProvider,
  CheckoutInput,
  CheckoutResult,
  PixQrCodeResult,
  WebhookEvent,
  WebhookVerifyContext,
  PaymentStatus,
} from "./types";

export const StripeProvider: PaymentProvider = {
  name: "stripe",

  async createCheckout(_input: CheckoutInput): Promise<CheckoutResult> {
    throw new Error("Stripe adapter not yet wired");
  },

  async createPixQrCode(_input: CheckoutInput): Promise<PixQrCodeResult> {
    throw new Error("Stripe does not support PIX QR Code");
  },

  async verifyWebhook(_ctx: WebhookVerifyContext): Promise<WebhookEvent> {
    throw new Error("Stripe webhook verification pending");
  },

  async getPaymentStatus(_id: string): Promise<PaymentStatus> {
    throw new Error("Stripe getPaymentStatus pending");
  },
};
