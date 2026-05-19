import Link from "next/link";
import { listAllOrders } from "@/lib/data/orders";
import { formatBRL } from "@/lib/utils";
import { FulfillButton } from "@/components/admin/fulfill-button";
import { toggleFulfilledAction } from "./actions";
import type { Order } from "@/types";

type Search = { searchParams: Promise<{ status?: string; fulfilled?: string }> };

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Aguardando",
  paid: "Pago",
  failed: "Falhou",
  expired: "Expirado",
  refunded: "Reembolsado",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  pending: "bg-amber-500/15 text-amber-500",
  paid: "bg-emerald-500/15 text-emerald-500",
  failed: "bg-destructive/15 text-destructive",
  expired: "bg-muted text-muted-foreground",
  refunded: "bg-sky-500/15 text-sky-500",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "status=pending", label: "Aguardando" },
  { value: "status=paid&fulfilled=false", label: "Pagos não entregues" },
  { value: "status=paid&fulfilled=true", label: "Entregues" },
  { value: "status=expired", label: "Expirados" },
];

export default async function AdminOrdersPage({ searchParams }: Search) {
  const { status, fulfilled } = await searchParams;
  const opts: Parameters<typeof listAllOrders>[0] = {};
  if (status === "pending" || status === "paid" || status === "failed" || status === "expired" || status === "refunded") {
    opts.status = status;
  }
  if (fulfilled === "true") opts.fulfilled = true;
  if (fulfilled === "false") opts.fulfilled = false;

  const orders = await listAllOrders(opts);
  const currentQs = new URLSearchParams();
  if (status) currentQs.set("status", status);
  if (fulfilled) currentQs.set("fulfilled", fulfilled);
  const currentKey = currentQs.toString();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} resultado(s)</p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = f.value === currentKey;
          return (
            <Link
              key={f.value || "all"}
              href={`/admin/orders${f.value ? `?${f.value}` : ""}`}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-[var(--radius)] border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left p-3">Pedido</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Total</th>
              <th className="text-center p-3">Entrega</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 align-top">
                <td className="p-3">
                  <p className="font-mono text-xs">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(o.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.items.reduce((s, i) => s + i.quantity, 0)} item(ns) · {o.paymentMethod.toUpperCase()}
                  </p>
                </td>
                <td className="p-3">
                  <p className="text-sm">{o.fullName}</p>
                  <p className="text-xs text-muted-foreground">{o.email}</p>
                </td>
                <td className="p-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </td>
                <td className="p-3 text-right">{formatBRL(o.totalCents)}</td>
                <td className="p-3 text-center">
                  {o.fulfilled ? (
                    <span className="text-emerald-500 text-xs">Entregue</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Pendente</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  {o.status === "paid" && (
                    <FulfillButton
                      fulfilled={o.fulfilled}
                      action={async () => {
                        "use server";
                        await toggleFulfilledAction(o.id, !o.fulfilled);
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Nenhum pedido.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
