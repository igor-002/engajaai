import Link from "next/link";
import { Home, Package, Tags, ShoppingBag, Users } from "lucide-react";

export const metadata = { title: "Admin · EngajaAI" };

const NAV = [
  { href: "/admin", label: "Visão geral", Icon: Home },
  { href: "/admin/products", label: "Produtos", Icon: Package },
  { href: "/admin/categories", label: "Categorias", Icon: Tags },
  { href: "/admin/orders", label: "Pedidos", Icon: ShoppingBag },
  { href: "/admin/team", label: "Admins", Icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth, admin membership and aal2 are enforced by middleware (/admin/* gate).
  // This layout assumes the request is already authorized.
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
