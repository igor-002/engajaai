"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm({ next = "/account" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    const supa = createSupabaseBrowserClient();
    if (!supa) {
      setErr("Auth não configurado.");
      setSubmitting(false);
      return;
    }
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supa.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setSubmitting(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-[var(--radius)] border border-success/30 bg-success/10 p-4 text-sm">
        Link de acesso enviado para <strong>{email}</strong>. Confira sua caixa de entrada.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="account-email">Email</Label>
        <Input
          id="account-email"
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
  );
}
