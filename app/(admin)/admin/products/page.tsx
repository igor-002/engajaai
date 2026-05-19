import Link from "next/link";
import { Plus } from "lucide-react";
import { listAllProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProductAction } from "./actions";
import { formatBRL } from "@/lib/utils";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([listAllProducts(), getCategories()]);
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} no catálogo</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus size={16} /> Novo produto
          </Link>
        </Button>
      </header>

      <div className="rounded-[var(--radius)] border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left p-3">Produto</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-right p-3">Preço</th>
              <th className="text-right p-3">Estoque</th>
              <th className="text-center p-3">Destaque</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.slug}</p>
                </td>
                <td className="p-3 text-muted-foreground">{catName(p.categorySlug)}</td>
                <td className="p-3 text-right">{formatBRL(p.priceCents)}</td>
                <td className="p-3 text-right">{p.stock}</td>
                <td className="p-3 text-center">{p.featured ? "★" : "—"}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/admin/products/${p.id}`}>Editar</Link>
                    </Button>
                    <DeleteButton
                      label="Excluir"
                      confirmText={`Excluir "${p.name}"?`}
                      action={async () => {
                        "use server";
                        await deleteProductAction(p.id);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Nenhum produto. <Link href="/admin/products/new" className="text-primary hover:underline">Criar o primeiro</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
