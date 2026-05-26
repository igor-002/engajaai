"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { formatBRL } from "@/lib/utils";
import type { CartItem } from "@/types";

export function OrderSummary({
  items,
  subtotalCents,
  discountCents,
  totalCents,
}: {
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}) {
  return (
    <aside className="rounded-[var(--radius)] border border-border bg-card p-5 space-y-4 sticky top-20">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Resumo do pedido</h2>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck size={14} /> Pagamento seguro
        </span>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
      ) : (
        <ul className="space-y-3" aria-label="Itens do pedido">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3 text-sm">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {i.imageUrl ? (
                  <Image
                    src={i.imageUrl}
                    alt={i.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span
                    className="absolute inset-0 grid place-items-center text-[10px] text-muted-foreground"
                    aria-hidden="true"
                  >
                    img
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="line-clamp-2">{i.name}</p>
                <p className="text-xs text-muted-foreground">Qtd. {i.quantity}</p>
              </div>
              <p className="font-mono tabular-nums">
                {formatBRL(i.priceCents * i.quantity)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border pt-4 space-y-1.5 text-sm">
        <Row label="Subtotal" value={formatBRL(subtotalCents)} />
        <Row label="Descontos" value={`- ${formatBRL(discountCents)}`} muted={discountCents === 0} />
        <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-lg font-bold font-mono tabular-nums">{formatBRL(totalCents)}</span>
        </div>
      </div>
    </aside>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground font-mono tabular-nums" : "font-mono tabular-nums"}>
        {value}
      </span>
    </div>
  );
}
