"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  type CategoryInput,
} from "@/lib/data/categories";
import { uploadImage, deleteImageByUrl } from "@/lib/storage";
import { requireAdminAal2 } from "@/lib/auth/admin-guard";
import { logAdminAction } from "@/lib/auth/audit";

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
  await requireAdminAal2();
  const base = parseForm(formData);
  const file = getUploadedFile(formData);
  const imageUrl = file ? await uploadImage(file, "categories") : null;
  const id = await createCategory({ ...base, imageUrl });
  await logAdminAction({
    action: "category.create",
    target_table: "categories",
    target_id: id ?? base.slug,
    success: true,
    meta: { slug: base.slug, name: base.name },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireAdminAal2();
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
  await logAdminAction({
    action: "category.update",
    target_table: "categories",
    target_id: id,
    success: true,
    meta: { slug: base.slug },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await requireAdminAal2();
  const existing = await getCategoryById(id);
  await deleteCategory(id);
  if (existing?.imageUrl) await deleteImageByUrl(existing.imageUrl);
  await logAdminAction({
    action: "category.delete",
    target_table: "categories",
    target_id: id,
    success: true,
    meta: { slug: existing?.slug },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
