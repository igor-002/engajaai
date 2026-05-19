import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/data/orders";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { orderId } = await params;
  try {
    const order = await getOrderById(orderId);
    if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      method: order.paymentMethod,
      email: order.email,
      pixCode: order.pixCode,
      pixQrCodeUrl: order.pixQrCodeUrl,
      expiresAt: order.expiresAt,
      totalCents: order.totalCents,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "status_error" },
      { status: 500 },
    );
  }
}
