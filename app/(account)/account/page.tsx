import Link from "next/link";
import { Package } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listOrdersByUserId } from "@/lib/data/orders";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/account/order-card";
import { LoginForm } from "@/components/account/login-form";
import { SignOutButton } from "@/components/account/sign-out-button";

export const metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const supa = await createSupabaseServerClient();
  const { data } = supa ? await supa.auth.getUser() : { data: { user: null } };
  const user = data.user;

  if (!user) {
    return (
      <section className="container-x max-w-md py-12 md:py-16">
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 md:p-8">
          <header className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">Minha conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Digite seu email para receber um link de acesso. Sem senhas.
            </p>
          </header>
          <LoginForm />
          <p className="mt-4 text-xs text-muted-foreground">
            Já comprou como visitante? Use o mesmo email do checkout — seus pedidos aparecerão aqui.
          </p>
        </div>
      </section>
    );
  }

  const orders = await listOrdersByUserId(user.id);

  return (
    <section className="container-x max-w-4xl py-10 md:py-14">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <h2 className="text-lg font-semibold mb-4">Meus pedidos</h2>

      {orders.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-border bg-card p-8 text-center">
          <Package className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="text-sm text-muted-foreground">Você ainda não fez nenhum pedido.</p>
          <Button asChild className="mt-4">
            <Link href="/">Explorar produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}
