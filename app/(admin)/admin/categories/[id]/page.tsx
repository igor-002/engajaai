import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategoryById } from "@/lib/data/categories";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategoryAction } from "../actions";

type Params = { params: Promise<{ id: string }> };

async function getSortOrder(id: string): Promise<number> {
  const { data } = await getSupabaseAdmin().from("categories").select("sort_order").eq("id", id).maybeSingle();
  return (data?.sort_order as number | undefined) ?? 0;
}

export default async function EditCategoryPage({ params }: Params) {
  const { id } = await params;
  const cat = await getCategoryById(id);
  if (!cat) notFound();
  const sortOrder = await getSortOrder(id);

  async function action(formData: FormData) {
    "use server";
    await updateCategoryAction(id, formData);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/admin/categories" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Categorias
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Editar categoria</h1>
      <CategoryForm mode="edit" initial={{ ...cat, sortOrder }} action={action} />
    </div>
  );
}
