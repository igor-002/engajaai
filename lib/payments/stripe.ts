import type { PaymentProvider, CheckoutInput, CheckoutResult, WebhookEvent } from "./types";
import { env } from "@/lib/env";

// Skeleton — uses Stripe Checkout Sessions. Install `stripe` package when activating.
// import Stripe from "stripe";

export const StripeProvider: PaymentProvider = {
  name: "stripe",

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY missing");
    // const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({...});
    throw new Error("Stripe adapter not yet wired — install `stripe` package and uncomment imports.");
  },

  async verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent> {
    if (!env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET missing");
    throw new Error("Stripe webhook verification pending");
  },

  async getPaymentStatus(externalPaymentId: string): Promise<WebhookEvent["type"]> {
    throw new Error("Stripe getPaymentStatus pending");
  },
};
