"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, Clock, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";
import { useCart } from "@/lib/cart/store";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type StatusKey = "pending" | "paid" | "failed" | "expired" | "refunded";

type StatusResponse = {
  orderId: string;
  status: StatusKey;
  method: "pix" | "card";
  email?: string;
  pixCode?: string;
  pixQrCodeUrl?: string;
  expiresAt?: string;
  totalCents: number;
};

const TERMINAL: StatusKey[] = ["paid", "failed", "expired", "refunded"];

function useCountdown(expiresAt?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return "00:00";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function SuccessClient({ orderId, isPix }: { orderId: string | null; isPix: boolean }) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [magicLinkSentTo, setMagicLinkSentTo] = useState<string | null>(null);
  const clearCart = useCart((s) => s.clear);

  const fetchStatus = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/checkout/${orderId}/status`, { cache: "no-store" });
      if (!res.ok) throw new Error("Pedido não encontrado");
      const json = (await res.json()) as StatusResponse;
      setData(json);
      if (json.status === "paid") clearCart();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    }
  }, [orderId, clearCart]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!data || TERMINAL.includes(data.status)) return;
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [data, fetchStatus]);

  useEffect(() => {
    if (!data || data.status !== "paid" || !data.email || !orderId) return;
    const flagKey = `otp-sent-${orderId}`;
    if (typeof window === "undefined" || sessionStorage.getItem(flagKey)) return;

    let cancelled = false;
    (async () => {
      const supa = createSupabaseBrowserClient();
      if (!supa) return;
      const { data: userData } = await supa.auth.getUser();
      if (cancelled || userData.user) return;
      const redirectTo = `${window.location.origin}/auth/callback?next=/account`;
      const { error } = await supa.auth.signInWithOtp({
        email: data.email!,
        options: { emailRedirectTo: redirectTo },
      });
      if (!cancelled && !error) {
        sessionStorage.setItem(flagKey, "1");
        setMagicLinkSentTo(data.email!);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data, orderId]);

  const countdown = useCountdown(data?.expiresAt);

  if (!orderId) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Pedido não encontrado</h1>
        <p className="mt-2 text-muted-foreground">URL inválida.</p>
        <Button asChild className="mt-6"><Link href="/">Voltar à loja</Link></Button>
      </div>
    );
  }

  if (err) {
    return (
      <div className="text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-4">
          <XCircle size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{err}</h1>
        <Button asChild className="mt-6"><Link href="/checkout">Tentar de novo</Link></Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={32} />
        <p className="mt-4 text-sm text-muted-foreground">Carregando pedido...</p>
      </div>
    );
  }

  if (data.status === "paid") {
    return (
      <div className="text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-[color:hsl(142_71%_55%)] mb-4">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pagamento confirmado!</h1>
        <p className="mt-2 text-muted-foreground">
          Pedido <span className="font-mono">#{data.orderId.slice(0, 8)}</span>{" "}
          no valor de {formatBRL(data.totalCents)}.
          Enviaremos o produto por email em breve.
        </p>
        {magicLinkSentTo && (
          <div className="mx-auto mt-6 max-w-md rounded-[var(--radius)] border border-border bg-card p-4 text-left text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Mail size={16} className="text-primary" />
              Link de acesso enviado
            </p>
            <p className="mt-1 text-muted-foreground">
              Enviamos um link para <strong>{magicLinkSentTo}</strong>. Clique para acessar
              seus pedidos quando quiser, sem precisar de senha.
            </p>
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild><Link href="/account">Ver meus pedidos</Link></Button>
          <Button asChild variant="secondary"><Link href="/">Continuar comprando</Link></Button>
        </div>
      </div>
    );
  }

  if (data.status === "expired" || data.status === "failed") {
    return (
      <div className="text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-4">
          <XCircle size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {data.status === "expired" ? "Pagamento expirado" : "Pagamento não autorizado"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pedido <span className="font-mono">#{data.orderId.slice(0, 8)}</span>.
          Você pode tentar novamente.
        </p>
        <Button asChild className="mt-6"><Link href="/checkout">Tentar novamente</Link></Button>
      </div>
    );
  }

  if (isPix && data.method === "pix" && data.pixCode && data.pixQrCodeUrl) {
    return (
      <div className="space-y-6">
        <header className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
            <Clock size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pague com PIX</h1>
          <p className="mt-2 text-muted-foreground">
            Pedido <span className="font-mono">#{data.orderId.slice(0, 8)}</span> · {formatBRL(data.totalCents)}
          </p>
          {countdown && (
            <p className="mt-1 text-xs text-muted-foreground">Expira em {countdown}</p>
          )}
        </header>

        <div className="rounded-[var(--radius)] border border-border bg-card p-6">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.pixQrCodeUrl}
              alt="QR Code PIX"
              className="h-64 w-64 rounded-md bg-white p-2"
            />
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Copia e cola</p>
            <div className="flex gap-2">
              <code className="flex-1 truncate rounded-md border border-border bg-muted px-3 py-2 text-xs font-mono">
                {data.pixCode}
              </code>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(data.pixCode ?? "");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={14} />
            Aguardando confirmação do pagamento...
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Pague no app do seu banco. Esta página atualiza automaticamente quando recebermos a confirmação.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Loader2 className="mx-auto animate-spin text-muted-foreground mb-4" size={32} />
      <h1 className="text-2xl font-bold tracking-tight">Aguardando pagamento</h1>
      <p className="mt-2 text-muted-foreground">
        Pedido <span className="font-mono">#{data.orderId.slice(0, 8)}</span>. Confirmaremos por email.
      </p>
    </div>
  );
}
