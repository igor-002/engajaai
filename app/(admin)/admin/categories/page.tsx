import Link from "next/link";
import { Plus } from "lucide-react";
import { getCategories } from "@/lib/data/categories";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCategoryAction } from "./actions";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">{categories.length} no catálogo</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus size={16} /> Nova categoria
          </Link>
        </Button>
      </header>

      <div className="rounded-[var(--radius)] border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Descrição</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{c.slug}</td>
                <td className="p-3 text-muted-foreground truncate max-w-md">{c.description}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/admin/categories/${c.id}`}>Editar</Link>
                    </Button>
                    <DeleteButton
                      label="Excluir"
                      confirmText={`Excluir "${c.name}"? Produtos vinculados precisam ser realocados primeiro.`}
                      action={async () => {
                        "use server";
                        await deleteCategoryAction(c.id);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Nenhuma categoria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
