"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { checkAdminEmail } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    const normalized = email.trim().toLowerCase();
    if (await checkAdminEmail(normalized)) {
      setSubmitting(false);
      setErr("Esta conta é admin. Use /admin/login.");
      return;
    }
    const supa = createSupabaseBrowserClient();
    if (!supa) {
      setErr("Auth não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e ANON_KEY.");
      setSubmitting(false);
      return;
    }
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supa.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: redirectTo },
    });
    setSubmitting(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  async function oauth(provider: "google" | "discord") {
    const supa = createSupabaseBrowserClient();
    if (!supa) {
      setErr("Auth não configurado.");
      return;
    }
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supa.auth.signInWithOAuth({ provider, options: { redirectTo } });
  }

  return (
    <section className="container-x max-w-md py-12 md:py-20">
      <div className="rounded-[var(--radius)] border border-border p-6 md:p-8 bg-card">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acesse sua conta para continuar.
          </p>
        </header>

        <div className="space-y-2">
          <Button variant="secondary" className="w-full" onClick={() => oauth("google")}>
            Entrar com Google
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => oauth("discord")}>
            Entrar com Discord
          </Button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        {sent ? (
          <div className="rounded-[var(--radius)] border border-success/30 bg-success/10 p-3 text-sm">
            Link de acesso enviado para <strong>{email}</strong>. Confira sua caixa de entrada.
          </div>
        ) : (
          <form onSubmit={onEmail} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || !email}>
              <Mail />
              {submitting ? "Enviando..." : "Receber link por email"}
            </Button>
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
          </form>
        )}

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Ao continuar, você aceita os{" "}
          <Link href="/terms" className="text-primary hover:underline">
            termos e condições
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
