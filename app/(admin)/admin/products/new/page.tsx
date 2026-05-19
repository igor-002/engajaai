import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "../actions";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Produtos
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Novo produto</h1>
      <ProductForm mode="create" categories={categories} action={createProductAction} />
    </div>
  );
}
