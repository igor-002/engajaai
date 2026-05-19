import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import {
  recordWebhookEvent,
  updateOrderStatusByExternalId,
} from "@/lib/data/orders";

export async function POST(request: Request) {
  const provider = getPaymentProvider();
  const rawBody = await request.text();
  const url = new URL(request.url);

  let event;
  try {
    event = await provider.verifyWebhook({
      rawBody,
      headers: request.headers,
      query: url.searchParams,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "verify_failed" },
      { status: 400 },
    );
  }

  try {
    const dedup = await recordWebhookEvent({
      id: event.id,
      eventType: event.rawEvent,
      externalPaymentId: event.externalPaymentId,
      orderId: null,
      devMode: event.devMode,
      rawPayload: event.rawPayload,
    });
    if (dedup.alreadySeen) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    await updateOrderStatusByExternalId(event.externalPaymentId, event.type);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[payment-webhook] persist error", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "persist_failed" },
      { status: 500 },
    );
  }
}
