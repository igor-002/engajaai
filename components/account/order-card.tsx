import Link from "next/link";
import { Package, QrCode, CheckCircle2, Clock, XCircle, RotateCcw } from "lucide-react";
import type { Order } from "@/types";
import { formatBRL } from "@/lib/utils";

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; color: string; Icon: typeof Clock }
> = {
  pending: { label: "Aguardando pagamento", color: "bg-amber-500/15 text-amber-500 border-amber-500/30", Icon: Clock },
  paid: { label: "Pago", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", Icon: CheckCircle2 },
  failed: { label: "Falhou", color: "bg-destructive/15 text-destructive border-destructive/30", Icon: XCircle },
  expired: { label: "Expirado", color: "bg-muted text-muted-foreground border-border", Icon: XCircle },
  refunded: { label: "Reembolsado", color: "bg-sky-500/15 text-sky-500 border-sky-500/30", Icon: RotateCcw },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OrderCard({ order }: { order: Order }) {
  const cfg = STATUS_CONFIG[order.status];
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const showPixCta = order.status === "pending" && order.paymentMethod === "pix";

  return (
    <article className="rounded-[var(--radius)] border border-border bg-card p-5 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package size={14} />
            <span className="font-mono">#{order.id.slice(0, 8)}</span>
            <span>·</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            {order.paymentMethod === "pix" ? "PIX" : "Cartão"}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.color}`}
        >
          <cfg.Icon size={12} />
          {cfg.label}
        </span>
      </header>

      <ul className="space-y-1.5 text-sm">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-3">
            <span className="text-foreground truncate">
              <span className="text-muted-foreground mr-1.5">{item.quantity}×</span>
              {item.name}
            </span>
            <span className="text-muted-foreground shrink-0">
              {formatBRL(item.priceCents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </span>
        <span className="text-base font-semibold">{formatBRL(order.totalCents)}</span>
      </div>

      {showPixCta && (
        <Link
          href={`/checkout/success?order=${order.id}&pix=1`}
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <QrCode size={14} />
          Ver QR Code
        </Link>
      )}
    </article>
  );
}
