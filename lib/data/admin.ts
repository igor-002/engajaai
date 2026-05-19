import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function listAdmins(): Promise<string[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("admin_users")
    .select("email")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listAdmins: ${error.message}`);
  return (data ?? []).map((r) => r.email as string);
}
