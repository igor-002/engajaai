"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signInAdmin, requestPasswordReset } from "./actions";

type Mode = "signin" | "reset";

const ERROR_MESSAGES: Record<string, string> = {
  not_admin: "Esta conta não tem permissão de admin.",
  disabled: "Esta conta de admin foi desabilitada.",
  use_admin_login: "Admins devem entrar por esta tela.",
  oauth: "Falha no login com Google.",
};

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") ?? "/admin";
  const errorKey = params.get("error");
  const flashError = errorKey ? ERROR_MESSAGES[errorKey] ?? null : null;

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    setInfo(null);
    const form = new FormData(e.currentTarget);
    form.set("next", nextPath);
    const result = await signInAdmin(form);
    setSubmitting(false);
    if (!result.ok) {
      setErr(result.error);
      return;
    }
    router.replace(result.nextPath);
    router.refresh();
  }

  async function onReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    setInfo(null);
    const form = new FormData(e.currentTarget);
    const result = await requestPasswordReset(form);
    setSubmitting(false);
    if (!result.ok) {
      setErr(result.error);
      return;
    }
    setInfo("Se este email for admin, enviamos um link para definir a senha.");
  }

  async function onGoogle() {
    const supa = createSupabaseBrowserClient();
    if (!supa) {
      setErr("Auth indisponível");
      return;
    }
    const redirectTo = `${window.location.origin}/auth/admin-callback?next=${encodeURIComponent(nextPath)}`;
    await supa.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  }

  return (
    <section className="container-x max-w-md py-12 md:py-20">
      <div className="rounded-[var(--radius)] border border-border p-6 md:p-8 bg-card">
        <header className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Acesso administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Área restrita. Login exige email autorizado, senha e MFA.
          </p>
        </header>

        {flashError && (
          <div className="rounded-[var(--radius)] border border-destructive/30 bg-destructive/10 p-3 text-sm mb-4">
            {flashError}
          </div>
        )}

        {mode === "signin" ? (
          <>
            <Button variant="secondary" className="w-full" onClick={onGoogle}>
              Entrar com Google
            </Button>
            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">ou</span>
              <Separator className="flex-1" />
            </div>
            <form onSubmit={onSignIn} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting || !email || !password}>
                <Mail />
                {submitting ? "Entrando..." : "Entrar"}
              </Button>
              {err && (
                <p role="alert" className="text-sm text-destructive">
                  {err}
                </p>
              )}
            </form>
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setErr(null);
                setInfo(null);
              }}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline w-full text-center"
            >
              Esqueci minha senha / Definir senha pela primeira vez
            </button>
          </>
        ) : (
          <form onSubmit={onReset} className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Informe seu email de admin. Enviaremos um link para definir uma nova senha.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || !email}>
              {submitting ? "Enviando..." : "Enviar link"}
            </Button>
            {info && (
              <p role="status" className="text-sm text-emerald-500">
                {info}
              </p>
            )}
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErr(null);
                setInfo(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline w-full text-center"
            >
              Voltar ao login
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
