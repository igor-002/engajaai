import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, Package, Tags, ShoppingBag, ShieldOff } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/data/admin";

export const metadata = { title: "Admin · EngajaAI" };

const NAV = [
  { href: "/admin", label: "Visão geral", Icon: Home },
  { href: "/admin/products", label: "Produtos", Icon: Package },
  { href: "/admin/categories", label: "Categorias", Icon: Tags },
  { href: "/admin/orders", label: "Pedidos", Icon: ShoppingBag },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supa = await createSupabaseServerClient();
  const { data } = supa ? await supa.auth.getUser() : { data: { user: null } };
  const user = data.user;

  if (!user) {
    redirect("/login?next=/admin");
  }

  const allowed = await isAdminEmail(user.email);
  if (!allowed) {
    return (
      <section className="container-x max-w-md py-16 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-4">
          <ShieldOff size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua conta ({user.email}) não tem permissão de administrador.
        </p>
      </section>
    );
  }

  return (
    <div className="container-x py-6 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <aside className="md:sticky md:top-20 md:self-start">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Admin
          </p>
          <nav className="flex md:flex-col gap-1">
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
