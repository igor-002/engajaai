"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { verifyChallenge } from "./actions";

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; factorId: string; challengeId: string };

export function ChallengeClient() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") ?? "/admin";
  const [state, setState] = useState<State>({ phase: "loading" });
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supa = createSupabaseBrowserClient();
      if (!supa) {
        if (!cancelled) setState({ phase: "error", message: "Auth indisponível" });
        return;
      }
      const { data: factorData, error: listErr } = await supa.auth.mfa.listFactors();
      if (listErr || !factorData) {
        if (!cancelled) {
          setState({ phase: "error", message: listErr?.message ?? "Falha ao listar fatores" });
        }
        return;
      }
      const verified = (factorData.totp ?? []).find((f) => f.status === "verified");
      if (!verified) {
        if (!cancelled) setState({ phase: "error", message: "MFA não configurado" });
        return;
      }
      const challenge = await supa.auth.mfa.challenge({ factorId: verified.id });
      if (challenge.error || !challenge.data) {
        if (!cancelled) {
          setState({
            phase: "error",
            message: challenge.error?.message ?? "Falha ao gerar desafio",
          });
        }
        return;
      }
      if (!cancelled) {
        setState({
          phase: "ready",
          factorId: verified.id,
          challengeId: challenge.data.id,
        });
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.phase !== "ready") return;
    setSubmitting(true);
    setErr(null);
    const result = await verifyChallenge(state.factorId, state.challengeId, code);
    setSubmitting(false);
    if (!result.ok) {
      setErr(result.error);
      const supa = createSupabaseBrowserClient();
      if (supa) {
        const ch = await supa.auth.mfa.challenge({ factorId: state.factorId });
        if (ch.data) setState({ ...state, challengeId: ch.data.id });
      }
      return;
    }
    router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
    router.refresh();
  }

  async function cancel() {
    const supa = createSupabaseBrowserClient();
    await supa?.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <section className="container-x max-w-md py-12 md:py-20">
      <div className="rounded-[var(--radius)] border border-border p-6 md:p-8 bg-card">
        <header className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <KeyRound size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verificação MFA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Abra seu app autenticador e digite o código de 6 dígitos.
          </p>
        </header>

        {state.phase === "loading" && (
          <p className="text-sm text-muted-foreground text-center">Preparando desafio...</p>
        )}
        {state.phase === "error" && (
          <p role="alert" className="text-sm text-destructive text-center">
            {state.message}
          </p>
        )}
        {state.phase === "ready" && (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || code.length !== 6}>
              {submitting ? "Verificando..." : "Verificar"}
            </Button>
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
          </form>
        )}

        <button
          type="button"
          onClick={cancel}
          className="mt-5 text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline w-full text-center"
        >
          Cancelar e sair
        </button>
      </div>
    </section>
  );
}
