import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const supa = await createSupabaseServerClient();
  const { data } = supa ? await supa.auth.getUser() : { data: { user: null } };
  const user = data.user;

  return (
    <section className="container-x py-12 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Minha conta</h1>

      {!user ? (
        <div className="mt-6 rounded-[var(--radius)] border border-border p-6">
          <p className="text-sm text-muted-foreground">
            Você precisa estar logado para ver esta página.
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="rounded-[var(--radius)] border border-border p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
            <p className="text-base font-medium">{user.email}</p>
          </div>

          <div className="rounded-[var(--radius)] border border-border p-6">
            <h2 className="text-lg font-semibold">Pedidos recentes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Você ainda não fez nenhum pedido.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
