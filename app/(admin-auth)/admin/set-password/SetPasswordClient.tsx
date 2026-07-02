"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { setNewPassword } from "./actions";

export function SetPasswordClient() {
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supa = createSupabaseBrowserClient();
    if (!supa) {
      setErr("Auth indisponível");
      return;
    }

    (async () => {
      const url = new URL(window.location.href);
      const linkErr = url.searchParams.get("error_description") ?? url.searchParams.get("error");
      const code = url.searchParams.get("code");

      if (linkErr) {
        setErr(linkErr);
        setSessionReady(true);
        return;
      }

      // PKCE recovery/invite links arrive with ?code=; exchange it for a session.
      if (code) {
        await supa.auth.exchangeCodeForSession(code).catch(() => null);
        // Clean the code out of the URL so a refresh can't retry a spent code.
        window.history.replaceState({}, "", url.pathname);
      }

      const { data } = await supa.auth.getUser();
      setSessionEmail(data.user?.email ?? null);
      setSessionReady(true);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    if (pw !== pw2) {
      setErr("As senhas não conferem");
      return;
    }
    setSubmitting(true);
    const form = new FormData();
    form.set("password", pw);
    const result = await setNewPassword(form);
    setSubmitting(false);
    if (!result.ok) {
      setErr(result.error);
      return;
    }
    setDone(true);
  }

  async function goToLogin() {
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
          <h1 className="text-2xl font-bold tracking-tight">Definir nova senha</h1>
          {sessionEmail && (
            <p className="text-sm text-muted-foreground mt-1">
              Para <strong>{sessionEmail}</strong>
            </p>
          )}
        </header>

        {!sessionReady && (
          <p className="text-sm text-muted-foreground text-center">Validando link...</p>
        )}

        {sessionReady && !sessionEmail && (
          <p role="alert" className="text-sm text-destructive text-center">
            Link inválido ou expirado. Solicite um novo em /admin/login.
          </p>
        )}

        {sessionReady && sessionEmail && !done && (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha (mín. 10 caracteres)</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={10}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password2">Confirmar senha</Label>
              <Input
                id="password2"
                type="password"
                autoComplete="new-password"
                required
                minLength={10}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || pw.length < 10}>
              {submitting ? "Salvando..." : "Salvar senha"}
            </Button>
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
          </form>
        )}

        {done && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-emerald-500">Senha definida com sucesso.</p>
            <Button onClick={goToLogin} className="w-full">
              Ir para login
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
