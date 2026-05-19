import { NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentProvider } from "@/lib/payments";
import { env } from "@/lib/env";
import { isValidCpf, isValidCellphone, normalizeCpf, normalizeCellphone } from "@/lib/payments/customer";
import { createOrder, attachPaymentToOrder } from "@/lib/data/orders";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const Body = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  taxId: z.string().refine(isValidCpf, { message: "CPF inválido" }),
  cellphone: z.string().refine(isValidCellphone, { message: "Telefone inválido" }),
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
    const issues = e instanceof z.ZodError ? e.issues.map((i) => i.message).join("; ") : "Payload inválido";
    return NextResponse.json({ error: issues }, { status: 400 });
  }

  const subtotal = parsed.items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  const total = Math.max(0, subtotal - parsed.discountCents);

  const supabase = await createSupabaseServerClient();
  let userId: string | null = null;
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  }

  const provider = getPaymentProvider();

  let order;
  try {
    order = await createOrder({
      userId,
      email: parsed.email,
      fullName: parsed.fullName,
      customerTaxId: normalizeCpf(parsed.taxId),
      customerCellphone: normalizeCellphone(parsed.cellphone),
      items: parsed.items,
      subtotalCents: subtotal,
      discountCents: parsed.discountCents,
      totalCents: total,
      paymentProvider: provider.name,
      paymentMethod: parsed.method,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao registrar pedido" },
      { status: 500 },
    );
  }

  const providerReady =
    (provider.name === "abacate" && !!env.ABACATE_API_KEY) ||
    (provider.name === "stripe" && !!env.STRIPE_SECRET_KEY);

  if (!providerReady) {
    return NextResponse.json({
      orderId: order.id,
      stub: true,
      message: "Provedor de pagamento não configurado — checkout em modo demo.",
    });
  }

  try {
    const checkoutInput = {
      email: parsed.email,
      fullName: parsed.fullName,
      taxId: parsed.taxId,
      cellphone: parsed.cellphone,
      method: parsed.method,
      items: parsed.items,
      totalCents: total,
      orderId: order.id,
      description: `Pedido ${order.id.slice(0, 8)}`,
      successUrl: `${env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${order.id}`,
      cancelUrl: `${env.NEXT_PUBLIC_SITE_URL}/checkout`,
    };

    if (parsed.method === "pix") {
      const result = await provider.createPixQrCode(checkoutInput);
      await attachPaymentToOrder({
        orderId: order.id,
        externalPaymentId: result.externalPaymentId,
        pixCode: result.pixCode,
        pixQrCodeUrl: result.pixQrCodeUrl,
        expiresAt: result.expiresAt,
      });
      return NextResponse.json({
        orderId: order.id,
        pixCode: result.pixCode,
        pixQrCodeUrl: result.pixQrCodeUrl,
        expiresAt: result.expiresAt,
      });
    }

    const result = await provider.createCheckout(checkoutInput);
    await attachPaymentToOrder({
      orderId: order.id,
      externalPaymentId: result.externalPaymentId,
    });
    return NextResponse.json({
      orderId: order.id,
      redirectUrl: result.redirectUrl,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao criar pagamento", orderId: order.id },
      { status: 500 },
    );
  }
}
