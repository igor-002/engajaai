"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { verifyEnrollment, unenrollFactor } from "./actions";

type EnrolState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | {
      phase: "ready";
      factorId: string;
      qrSvg: string;
      secret: string;
      challengeId: string;
    };

export function EnrollClient() {
  const router = useRouter();
  const [state, setState] = useState<EnrolState>({ phase: "loading" });
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const enroledFactorIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supa = createSupabaseBrowserClient();
      if (!supa) {
        if (!cancelled) setState({ phase: "error", message: "Auth indisponível" });
        return;
      }

      // Remove any stale unverified factor from a previous attempt.
      try {
        const { data } = await supa.auth.mfa.listFactors();
        for (const f of data?.totp ?? []) {
          if (f.status !== "verified") await supa.auth.mfa.unenroll({ factorId: f.id });
        }
      } catch {
        /* ignore */
      }

      const enroll = await supa.auth.mfa.enroll({ factorType: "totp" });
      if (enroll.error || !enroll.data) {
        if (!cancelled) {
          setState({
            phase: "error",
            message: enroll.error?.message ?? "Falha ao iniciar enrolment",
          });
        }
        return;
      }
      const factorId = enroll.data.id;
      enroledFactorIdRef.current = factorId;

      const challenge = await supa.auth.mfa.challenge({ factorId });
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
          factorId,
          qrSvg: enroll.data.totp.qr_code,
          secret: enroll.data.totp.secret,
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
    const result = await verifyEnrollment(state.factorId, state.challengeId, code);
    setSubmitting(false);
    if (!result.ok) {
      setErr(result.error);
      // Generate a fresh challenge for retry.
      const supa = createSupabaseBrowserClient();
      if (supa) {
        const ch = await supa.auth.mfa.challenge({ factorId: state.factorId });
        if (ch.data) {
          setState({ ...state, challengeId: ch.data.id });
        }
      }
      return;
    }
    enroledFactorIdRef.current = null;
    router.replace("/admin");
    router.refresh();
  }

  async function cancel() {
    if (state.phase === "ready") {
      await unenrollFactor(state.factorId);
    }
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
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Configurar MFA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Escaneie o QR code com Google Authenticator, 1Password ou Authy e digite o código.
          </p>
        </header>

        {state.phase === "loading" && (
          <p className="text-sm text-muted-foreground text-center">Carregando QR...</p>
        )}
        {state.phase === "error" && (
          <p role="alert" className="text-sm text-destructive text-center">
            {state.message}
          </p>
        )}
        {state.phase === "ready" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="rounded-md bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image
                  src={state.qrSvg}
                  alt="QR code"
                  width={192}
                  height={192}
                  unoptimized
                />
              </div>
            </div>
            <details className="text-xs text-muted-foreground mb-5">
              <summary className="cursor-pointer">Não consegue escanear? Mostrar código</summary>
              <code className="mt-2 block break-all rounded-md bg-muted px-3 py-2 font-mono">
                {state.secret}
              </code>
            </details>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="code">Código de 6 dígitos</Label>
                <Input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting || code.length !== 6}>
                {submitting ? "Verificando..." : "Confirmar"}
              </Button>
              {err && (
                <p role="alert" className="text-sm text-destructive">
                  {err}
                </p>
              )}
            </form>
          </>
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
