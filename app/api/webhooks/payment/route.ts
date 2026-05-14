import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(request: Request) {
  const provider = getPaymentProvider();
  const rawBody = await request.text();
  const sig =
    request.headers.get("x-signature") ??
    request.headers.get("stripe-signature") ??
    new URL(request.url).searchParams.get("webhookSecret") ??
    "";

  try {
    const event = await provider.verifyWebhook(rawBody, sig);
    // TODO: persist order status to Supabase by event.orderId / event.externalPaymentId
    // For now, log and ack.
    console.log("[payment-webhook]", event.type, event.orderId, event.externalPaymentId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Webhook error" },
      { status: 400 },
    );
  }
}
