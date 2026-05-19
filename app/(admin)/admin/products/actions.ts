"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/data/admin";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  type ProductInput,
} from "@/lib/data/products";
import { uploadImage, deleteImageByUrl } from "@/lib/storage";
import type { PaymentMethodKey } from "@/types";

async function requireAdmin() {
  const supa = await createSupabaseServerClient();
  if (!supa) throw new Error("Supabase indisponível");
  const { data } = await supa.auth.getUser();
  const user = data.user;
  if (!user || !(await isAdminEmail(user.email))) throw new Error("Acesso negado");
}

const Schema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug deve ser minúsculo, números e hífens"),
  name: z.string().min(2),
  description: z.string().min(2),
  priceCents: z.coerce.number().int().min(0),
  originalPriceCents: z.coerce.number().int().min(0).optional(),
  categoryId: z.string().uuid(),
  stock: z.coerce.number().int().min(0),
  paymentMethods: z.array(z.enum(["pix", "card"])).min(1),
  deliveryMode: z.enum(["auto", "manual"]),
  featured: z.boolean(),
});

type FormBase = Omit<ProductInput, "imageUrl">;

function parseForm(formData: FormData): FormBase {
  const methods = formData.getAll("paymentMethods").map((v) => String(v)) as PaymentMethodKey[];
  const parsed = Schema.parse({
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    priceCents: formData.get("priceCents"),
    originalPriceCents: formData.get("originalPriceCents") || undefined,
    categoryId: String(formData.get("categoryId") ?? "").trim(),
    stock: formData.get("stock"),
    paymentMethods: methods,
    deliveryMode: String(formData.get("deliveryMode") ?? "auto"),
    featured: formData.get("featured") === "on",
  });
  return {
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description,
    priceCents: parsed.priceCents,
    originalPriceCents: parsed.originalPriceCents ?? null,
    categoryId: parsed.categoryId,
    stock: parsed.stock,
    paymentMethods: parsed.paymentMethods,
    deliveryMode: parsed.deliveryMode,
    featured: parsed.featured,
  };
}

function getUploadedFile(formData: FormData): File | null {
  const raw = formData.get("image");
  if (raw instanceof File && raw.size > 0) return raw;
  return null;
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const base = parseForm(formData);
  const file = getUploadedFile(formData);
  const imageUrl = file ? await uploadImage(file, "products") : null;
  await createProduct({ ...base, imageUrl });
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAdmin();
  const base = parseForm(formData);
  const existing = await getProductById(id);
  if (!existing) throw new Error("Produto não encontrado");

  const file = getUploadedFile(formData);
  const remove = formData.get("removeImage") === "1";

  let imageUrl: string | null = existing.imageUrl ?? null;
  if (file) {
    imageUrl = await uploadImage(file, "products");
    if (existing.imageUrl) await deleteImageByUrl(existing.imageUrl);
  } else if (remove) {
    if (existing.imageUrl) await deleteImageByUrl(existing.imageUrl);
    imageUrl = null;
  }

  await updateProduct(id, { ...base, imageUrl });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const existing = await getProductById(id);
  await deleteProduct(id);
  if (existing?.imageUrl) await deleteImageByUrl(existing.imageUrl);
  revalidatePath("/admin/products");
  revalidatePath("/");
}
