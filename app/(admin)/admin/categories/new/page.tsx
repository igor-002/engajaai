import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategoryAction } from "../actions";

export default function NewCategoryPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/admin/categories" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Categorias
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Nova categoria</h1>
      <CategoryForm mode="create" action={createCategoryAction} />
    </div>
  );
}
