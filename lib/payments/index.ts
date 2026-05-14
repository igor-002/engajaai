import { env } from "@/lib/env";
import type { PaymentProvider } from "./types";
import { AbacatePayProvider } from "./abacate";
import { StripeProvider } from "./stripe";

export function getPaymentProvider(): PaymentProvider {
  switch (env.PAYMENT_PROVIDER) {
    case "abacate":
      return AbacatePayProvider;
    case "stripe":
      return StripeProvider;
    default:
      return AbacatePayProvider;
  }
}

export type { PaymentProvider, CheckoutInput, CheckoutResult, WebhookEvent } from "./types";
