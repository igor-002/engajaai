import Link from "next/link";
import { Package, Tags, ShoppingBag, ArrowRight } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatBRL } from "@/lib/utils";

async function getCounts() {
  const db = getSupabaseAdmin();
  const [products, categories, orders, pending, paid] = await Promise.all([
    db.from("products").select("id", { count: "exact", head: true }),
    db.from("categories").select("id", { count: "exact", head: true }),
    db.from("orders").select("id", { count: "exact", head: true }),
    db.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db
      .from("orders")
      .select("total_cents", { count: "exact" })
      .eq("status", "paid")
      .eq("fulfilled", false),
  ]);
  const paidUnfulfilledTotal = (paid.data ?? []).reduce(
    (s: number, r: { total_cents: number }) => s + r.total_cents,
    0,
  );
  return {
    products: products.count ?? 0,
    categories: categories.count ?? 0,
    orders: orders.count ?? 0,
    pending: pending.count ?? 0,
    paidUnfulfilled: paid.count ?? 0,
    paidUnfulfilledTotal,
  };
}

export default async function AdminDashboard() {
  const c = await getCounts();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Visão geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie catálogo e pedidos do EngajaAI.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Produtos" value={c.products} href="/admin/products" Icon={Package} />
        <Stat label="Categorias" value={c.categories} href="/admin/categories" Icon={Tags} />
        <Stat label="Pedidos" value={c.orders} href="/admin/orders" Icon={ShoppingBag} />
        <Stat label="Aguardando pagamento" value={c.pending} href="/admin/orders?status=pending" Icon={ShoppingBag} />
      </div>

      {c.paidUnfulfilled > 0 && (
        <div className="rounded-[var(--radius)] border border-amber-500/40 bg-amber-500/10 p-5">
          <h2 className="font-semibold">Pedidos pagos aguardando entrega</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {c.paidUnfulfilled} pedidos · {formatBRL(c.paidUnfulfilledTotal)} em produtos pendentes.
          </p>
          <Link
            href="/admin/orders?status=paid&fulfilled=false"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver pedidos <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  Icon,
}: {
  label: string;
  value: number;
  href: string;
  Icon: typeof Package;
}) {
  return (
    <Link
      href={href}
      className="rounded-[var(--radius)] border border-border bg-card p-4 hover:border-foreground/40 transition-colors"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Link>
  );
}
