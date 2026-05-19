import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Category } from "@/types";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

export async function getCategories(): Promise<Category[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("categories")
    .select("id, slug, name, description, image_url")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`getCategories: ${error.message}`);
  return (data ?? []).map((r) => rowToCategory(r as CategoryRow));
}

export type CategoryInput = {
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
};

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("categories")
    .select("id, slug, name, description, image_url")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getCategoryById: ${error.message}`);
  return data ? rowToCategory(data as CategoryRow) : undefined;
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("categories")
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      image_url: input.imageUrl ?? null,
      sort_order: input.sortOrder ?? 0,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`createCategory: ${error?.message}`);
  return data.id as string;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("categories")
    .update({
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      image_url: input.imageUrl ?? null,
      sort_order: input.sortOrder ?? 0,
    })
    .eq("id", id);
  if (error) throw new Error(`updateCategory: ${error.message}`);
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) throw new Error(`deleteCategory: ${error.message}`);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("categories")
    .select("id, slug, name, description, image_url")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getCategoryBySlug: ${error.message}`);
  return data ? rowToCategory(data as CategoryRow) : undefined;
}
