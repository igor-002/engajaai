"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MethodSelector } from "@/components/checkout/method-selector";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CouponInput } from "@/components/checkout/coupon-input";
import { useCart } from "@/lib/cart/store";
import { formatBRL } from "@/lib/utils";
import type { PaymentMethodKey } from "@/types";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotalCents());

  const [method, setMethod] = useState<PaymentMethodKey>("pix");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const canPay =
    accepted && name.trim().length > 2 && /\S+@\S+\.\S+/.test(email) && items.length > 0 && total > 0;

  async function applyCoupon(code: string): Promise<boolean> {
    // Stub: simple demo coupon
    if (code === "ENGAJA10") {
      setDiscount(Math.round(subtotal * 0.1));
      return true;
    }
    setDiscount(0);
    return false;
  }

  async function pay() {
    if (!canPay) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: name,
          method,
          items,
          discountCents: discount,
        }),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({ error: "Falha no checkout" }));
        throw new Error(t.error || "Falha no checkout");
      }
      const data = (await res.json()) as { redirectUrl?: string; orderId: string };
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = `/checkout/success?order=${data.orderId}`;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro inesperado");
      setLoading(false);
    }
  }

  return (
    <section className="container-x max-w-6xl py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Checkout</h1>
        <nav aria-label="breadcrumb" className="mt-2">
          <ol className="flex items-center gap-1 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Início</Link></li>
            <li aria-hidden="true"><ChevronRight size={14} /></li>
            <li className="text-foreground" aria-current="page">Checkout</li>
          </ol>
        </nav>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-3 space-y-6">
          <section className="rounded-[var(--radius)] border border-border bg-card p-5 md:p-6">
            <h2 className="text-sm font-semibold mb-3">Formas de pagamento</h2>
            <MethodSelector value={method} onChange={setMethod} />
          </section>

          <section className="rounded-[var(--radius)] border border-border bg-card p-5 md:p-6">
            <h2 className="text-sm font-semibold mb-3">Informações de contato</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[var(--radius)] border border-border bg-card p-5 md:p-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-input accent-[hsl(40_100%_47%)]"
              />
              <span className="text-sm text-muted-foreground">
                Eu aceito os{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  termos e condições
                </Link>{" "}
                desta compra.
              </span>
            </label>

            <Button
              size="xl"
              className="w-full"
              disabled={!canPay || loading}
              onClick={pay}
            >
              <Lock />
              {loading ? "Processando..." : `Pagar ${formatBRL(total)}`}
            </Button>

            {err && (
              <p role="alert" className="text-sm text-destructive" aria-live="polite">
                {err}
              </p>
            )}
          </section>
        </div>

        <div className="lg:col-span-2">
          <OrderSummary
            items={items}
            subtotalCents={subtotal}
            discountCents={discount}
            totalCents={total}
          />
          <div className="mt-4 rounded-[var(--radius)] border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-2">Cupom de desconto</h3>
            <CouponInput onApply={applyCoupon} />
          </div>
        </div>
      </div>
    </section>
  );
}
