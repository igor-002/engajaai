"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/data/admin";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  type CategoryInput,
} from "@/lib/data/categories";
import { uploadImage, deleteImageByUrl } from "@/lib/storage";

async function requireAdmin() {
  const supa = await createSupabaseServerClient();
  if (!supa) throw new Error("Supabase indisponível");
  const { data } = await supa.auth.getUser();
  const user = data.user;
  if (!user || !(await isAdminEmail(user.email))) throw new Error("Acesso negado");
}

const Schema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

type FormBase = Omit<CategoryInput, "imageUrl">;

function parseForm(formData: FormData): FormBase {
  const parsed = Schema.parse({
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  return {
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description || null,
    sortOrder: parsed.sortOrder,
  };
}

function getUploadedFile(formData: FormData): File | null {
  const raw = formData.get("image");
  if (raw instanceof File && raw.size > 0) return raw;
  return null;
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const base = parseForm(formData);
  const file = getUploadedFile(formData);
  const imageUrl = file ? await uploadImage(file, "categories") : null;
  await createCategory({ ...base, imageUrl });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireAdmin();
  const base = parseForm(formData);
  const existing = await getCategoryById(id);
  if (!existing) throw new Error("Categoria não encontrada");

  const file = getUploadedFile(formData);
  const remove = formData.get("removeImage") === "1";

  let imageUrl: string | null = existing.imageUrl ?? null;
  if (file) {
    imageUrl = await uploadImage(file, "categories");
    if (existing.imageUrl) await deleteImageByUrl(existing.imageUrl);
  } else if (remove) {
    if (existing.imageUrl) await deleteImageByUrl(existing.imageUrl);
    imageUrl = null;
  }

  await updateCategory(id, { ...base, imageUrl });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const existing = await getCategoryById(id);
  await deleteCategory(id);
  if (existing?.imageUrl) await deleteImageByUrl(existing.imageUrl);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
