import { NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentProvider } from "@/lib/payments";
import { env } from "@/lib/env";

const Body = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  method: z.enum(["pix", "card"]),
  discountCents: z.number().int().min(0).default(0),
  items: z
    .array(
      z.object({
        productId: z.string(),
        slug: z.string(),
        name: z.string(),
        priceCents: z.number().int().positive(),
        quantity: z.number().int().positive(),
        imageUrl: z.string().optional(),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch (e) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const subtotal = parsed.items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  const total = Math.max(0, subtotal - parsed.discountCents);

  // Stub order ID — replace with Supabase insert when DB is wired.
  const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const provider = getPaymentProvider();

  // If no API key configured, return a success stub for local development.
  const providerReady =
    (provider.name === "abacate" && !!env.ABACATE_API_KEY) ||
    (provider.name === "stripe" && !!env.STRIPE_SECRET_KEY);

  if (!providerReady) {
    return NextResponse.json({
      orderId,
      stub: true,
      message: "Provedor de pagamento não configurado — checkout em modo demo.",
    });
  }

  try {
    const result = await provider.createCheckout({
      email: parsed.email,
      fullName: parsed.fullName,
      method: parsed.method,
      items: parsed.items,
      totalCents: total,
      orderId,
      successUrl: `${env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${orderId}`,
      cancelUrl: `${env.NEXT_PUBLIC_SITE_URL}/checkout`,
    });

    return NextResponse.json({
      orderId,
      redirectUrl: result.redirectUrl,
      pixCode: result.pixCode,
      pixQrCodeUrl: result.pixQrCodeUrl,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao criar pagamento" },
      { status: 500 },
    );
  }
}
