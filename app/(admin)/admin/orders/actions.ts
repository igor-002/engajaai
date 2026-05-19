"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/data/admin";
import { markOrderFulfilled } from "@/lib/data/orders";

async function requireAdmin() {
  const supa = await createSupabaseServerClient();
  if (!supa) throw new Error("Supabase indisponível");
  const { data } = await supa.auth.getUser();
  const user = data.user;
  if (!user || !(await isAdminEmail(user.email))) throw new Error("Acesso negado");
}

export async function toggleFulfilledAction(orderId: string, fulfilled: boolean) {
  await requireAdmin();
  await markOrderFulfilled(orderId, fulfilled);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
