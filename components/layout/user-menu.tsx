"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, ShieldCheck, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Me = { email: string; isAdmin: boolean } | null;

export function UserMenu() {
  const router = useRouter();
  const [me, setMe] = useState<Me>(null);
  const [ready, setReady] = useState(false);

  async function refreshMe() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const json = (await res.json()) as { user: { email: string } | null; isAdmin?: boolean };
      if (json.user?.email) {
        setMe({ email: json.user.email, isAdmin: !!json.isAdmin });
      } else {
        setMe(null);
      }
    } catch {
      setMe(null);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    refreshMe();
    const supa = createSupabaseBrowserClient();
    if (!supa) return;
    const { data: sub } = supa.auth.onAuthStateChange(() => {
      refreshMe();
      router.refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (!ready) {
    return <div className="h-9 w-24" aria-hidden="true" />;
  }

  if (!me) {
    return (
      <Button variant="secondary" size="sm" asChild>
        <Link href="/login" aria-label="Entrar">
          <LogIn />
          <span className="hidden md:inline">Entrar</span>
        </Link>
      </Button>
    );
  }

  async function signOut() {
    const supa = createSupabaseBrowserClient();
    if (!supa) return;
    await supa.auth.signOut();
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      {me.isAdmin && (
        <Button variant="ghost" size="sm" asChild aria-label="Admin">
          <Link href="/admin">
            <ShieldCheck />
            <span className="hidden md:inline">Admin</span>
          </Link>
        </Button>
      )}
      <Button variant="ghost" size="sm" asChild aria-label="Minha conta">
        <Link href="/account">
          <User2 />
          <span className="hidden md:inline">Conta</span>
        </Link>
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={signOut}
        aria-label="Sair"
        className="hidden sm:inline-flex"
      >
        <LogOut />
        <span className="hidden md:inline">Sair</span>
      </Button>
    </div>
  );
}
