// Data access layer. Falls back to mock data when Supabase is not configured.
// Real Supabase queries get swapped in when env vars are present.

import { env } from "@/lib/env";
import * as mock from "./mock";

export const dataSource: "supabase" | "mock" =
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "supabase"
    : "mock";

export async function getCategories() {
  return mock.getCategories();
}

export async function getCategoryBySlug(slug: string) {
  return mock.getCategoryBySlug(slug);
}

export async function getProductsByCategory(slug: string) {
  return mock.getProductsByCategory(slug);
}

export async function getProductBySlug(slug: string) {
  return mock.getProductBySlug(slug);
}

export async function getFeaturedProducts() {
  return mock.getFeaturedProducts();
}

export async function searchProducts(q: string) {
  return mock.searchProducts(q);
}
