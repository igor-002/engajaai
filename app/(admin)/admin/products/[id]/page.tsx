import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductById } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";
import { updateProductAction } from "../actions";

type Params = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Params) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();

  const initial = {
    ...product,
    categoryId: categories.find((c) => c.slug === product.categorySlug)?.id,
  };

  async function action(formData: FormData) {
    "use server";
    await updateProductAction(id, formData);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Produtos
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Editar produto</h1>
      <ProductForm mode="edit" categories={categories} initial={initial} action={action} />
    </div>
  );
}
