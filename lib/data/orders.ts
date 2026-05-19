import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Order, CartItem, PaymentMethodKey } from "@/types";
import type { PaymentStatus } from "@/lib/payments/types";

type OrderRow = {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  customer_tax_id: string | null;
  customer_cellphone: string | null;
  items: CartItem[];
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  payment_provider: "abacate" | "stripe";
  payment_method: PaymentMethodKey;
  status: Order["status"];
  external_payment_id: string | null;
  pix_code: string | null;
  pix_qr_code_url: string | null;
  expires_at: string | null;
  fulfilled: boolean;
  fulfilled_at: string | null;
  created_at: string;
};

export type AdminOrder = Order & {
  fulfilled: boolean;
  fulfilledAt: string | null;
};

function rowToAdminOrder(row: OrderRow): AdminOrder {
  return {
    ...rowToOrder(row),
    fulfilled: row.fulfilled,
    fulfilledAt: row.fulfilled_at,
  };
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    customerTaxId: row.customer_tax_id ?? undefined,
    customerCellphone: row.customer_cellphone ?? undefined,
    items: row.items,
    subtotalCents: row.subtotal_cents,
    discountCents: row.discount_cents,
    totalCents: row.total_cents,
    paymentProvider: row.payment_provider,
    paymentMethod: row.payment_method,
    status: row.status,
    externalPaymentId: row.external_payment_id ?? undefined,
    pixCode: row.pix_code ?? undefined,
    pixQrCodeUrl: row.pix_qr_code_url ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
  };
}

export type CreateOrderInput = {
  userId: string | null;
  email: string;
  fullName: string;
  customerTaxId: string;
  customerCellphone: string;
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  paymentProvider: "abacate" | "stripe";
  paymentMethod: PaymentMethodKey;
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("orders")
    .insert({
      user_id: input.userId,
      email: input.email,
      full_name: input.fullName,
      customer_tax_id: input.customerTaxId,
      customer_cellphone: input.customerCellphone,
      items: input.items,
      subtotal_cents: input.subtotalCents,
      discount_cents: input.discountCents,
      total_cents: input.totalCents,
      payment_provider: input.paymentProvider,
      payment_method: input.paymentMethod,
      status: "pending",
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(`createOrder failed: ${error?.message}`);
  return rowToOrder(data as OrderRow);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getOrderById failed: ${error.message}`);
  return data ? rowToOrder(data as OrderRow) : null;
}

export type AttachPaymentInput = {
  orderId: string;
  externalPaymentId: string;
  pixCode?: string;
  pixQrCodeUrl?: string;
  expiresAt?: string;
};

export async function attachPaymentToOrder(input: AttachPaymentInput): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("orders")
    .update({
      external_payment_id: input.externalPaymentId,
      pix_code: input.pixCode ?? null,
      pix_qr_code_url: input.pixQrCodeUrl ?? null,
      expires_at: input.expiresAt ?? null,
    })
    .eq("id", input.orderId);
  if (error) throw new Error(`attachPaymentToOrder failed: ${error.message}`);
}

export async function updateOrderStatusByExternalId(
  externalPaymentId: string,
  status: Exclude<PaymentStatus, "pending">,
): Promise<{ orderId: string | null }> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("orders")
    .update({ status })
    .eq("external_payment_id", externalPaymentId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`updateOrderStatusByExternalId failed: ${error.message}`);
  return { orderId: (data?.id as string | undefined) ?? null };
}

export async function listOrdersByUserId(userId: string): Promise<Order[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listOrdersByUserId failed: ${error.message}`);
  return (data ?? []).map((r) => rowToOrder(r as OrderRow));
}

export async function listOrdersByEmail(email: string): Promise<Order[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listOrdersByEmail failed: ${error.message}`);
  return (data ?? []).map((r) => rowToOrder(r as OrderRow));
}

export async function listAllOrders(opts?: {
  status?: Order["status"];
  fulfilled?: boolean;
  limit?: number;
}): Promise<AdminOrder[]> {
  const db = getSupabaseAdmin();
  let q = db.from("orders").select("*").order("created_at", { ascending: false });
  if (opts?.status) q = q.eq("status", opts.status);
  if (typeof opts?.fulfilled === "boolean") q = q.eq("fulfilled", opts.fulfilled);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw new Error(`listAllOrders: ${error.message}`);
  return (data ?? []).map((r) => rowToAdminOrder(r as OrderRow));
}

export async function markOrderFulfilled(
  orderId: string,
  fulfilled: boolean,
): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("orders")
    .update({
      fulfilled,
      fulfilled_at: fulfilled ? new Date().toISOString() : null,
    })
    .eq("id", orderId);
  if (error) throw new Error(`markOrderFulfilled: ${error.message}`);
}

export async function linkOrphanOrdersByEmail(
  userId: string,
  email: string,
): Promise<{ linked: number }> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("orders")
    .update({ user_id: userId })
    .eq("email", email)
    .is("user_id", null)
    .select("id");
  if (error) throw new Error(`linkOrphanOrdersByEmail failed: ${error.message}`);
  return { linked: data?.length ?? 0 };
}

export async function recordWebhookEvent(input: {
  id: string;
  eventType: string;
  externalPaymentId: string;
  orderId: string | null;
  devMode: boolean;
  rawPayload: unknown;
}): Promise<{ alreadySeen: boolean }> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("webhook_events").insert({
    id: input.id,
    event_type: input.eventType,
    external_payment_id: input.externalPaymentId,
    order_id: input.orderId,
    dev_mode: input.devMode,
    raw_payload: input.rawPayload,
  });
  if (error) {
    if (error.code === "23505") return { alreadySeen: true };
    throw new Error(`recordWebhookEvent failed: ${error.message}`);
  }
  return { alreadySeen: false };
}
