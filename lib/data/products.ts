import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Product, PaymentMethodKey } from "@/types";

type CategoryJoin = { slug: string } | { slug: string }[] | null;

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  original_price_cents: number | null;
  image_url: string | null;
  category_id: string;
  stock: number;
  payment_methods: string[];
  delivery_mode: "auto" | "manual";
  featured: boolean;
  categories: CategoryJoin;
};

function joinedCategorySlug(c: CategoryJoin): string {
  if (!c) return "";
  if (Array.isArray(c)) return c[0]?.slug ?? "";
  return c.slug;
}

const SELECT = "id, slug, name, description, price_cents, original_price_cents, image_url, category_id, stock, payment_methods, delivery_mode, featured, categories(slug)";

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    originalPriceCents: row.original_price_cents ?? undefined,
    imageUrl: row.image_url ?? undefined,
    categorySlug: joinedCategorySlug(row.categories),
    stock: row.stock,
    paymentMethods: row.payment_methods as PaymentMethodKey[],
    deliveryMode: row.delivery_mode,
    featured: row.featured,
  };
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("products")
    .select(SELECT)
    .eq("categories.slug", categorySlug)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getProductsByCategory: ${error.message}`);
  return (data ?? [])
    .map((r) => r as unknown as ProductRow)
    .filter((r) => joinedCategorySlug(r.categories) === categorySlug)
    .map((r) => rowToProduct(r));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getProductBySlug: ${error.message}`);
  return data ? rowToProduct(data as unknown as ProductRow) : undefined;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("products")
    .select(SELECT)
    .eq("featured", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getFeaturedProducts: ${error.message}`);
  return (data ?? []).map((r) => rowToProduct(r as unknown as ProductRow));
}

export type ProductInput = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  originalPriceCents?: number | null;
  imageUrl?: string | null;
  categoryId: string;
  stock: number;
  paymentMethods: PaymentMethodKey[];
  deliveryMode: "auto" | "manual";
  featured: boolean;
};

export async function listAllProducts(): Promise<Product[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("products")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listAllProducts: ${error.message}`);
  return (data ?? []).map((r) => rowToProduct(r as unknown as ProductRow));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("products")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getProductById: ${error.message}`);
  return data ? rowToProduct(data as unknown as ProductRow) : undefined;
}

export async function createProduct(input: ProductInput): Promise<string> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("products")
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description,
      price_cents: input.priceCents,
      original_price_cents: input.originalPriceCents ?? null,
      image_url: input.imageUrl ?? null,
      category_id: input.categoryId,
      stock: input.stock,
      payment_methods: input.paymentMethods,
      delivery_mode: input.deliveryMode,
      featured: input.featured,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`createProduct: ${error?.message}`);
  return data.id as string;
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("products")
    .update({
      slug: input.slug,
      name: input.name,
      description: input.description,
      price_cents: input.priceCents,
      original_price_cents: input.originalPriceCents ?? null,
      image_url: input.imageUrl ?? null,
      category_id: input.categoryId,
      stock: input.stock,
      payment_methods: input.paymentMethods,
      delivery_mode: input.deliveryMode,
      featured: input.featured,
    })
    .eq("id", id);
  if (error) throw new Error(`updateProduct: ${error.message}`);
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) throw new Error(`deleteProduct: ${error.message}`);
}

export async function searchProducts(q: string): Promise<Product[]> {
  const term = q.trim();
  if (!term) return [];
  const db = getSupabaseAdmin();
  const escaped = term.replace(/[%_]/g, (m) => `\\${m}`);
  const pattern = `%${escaped}%`;
  const { data, error } = await db
    .from("products")
    .select(SELECT)
    .or(`name.ilike.${pattern},description.ilike.${pattern}`)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`searchProducts: ${error.message}`);
  return (data ?? []).map((r) => rowToProduct(r as unknown as ProductRow));
}
