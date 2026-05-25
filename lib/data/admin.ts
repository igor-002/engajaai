import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminRecord = {
  email: string;
  createdAt: string;
  totpEnrolledAt: string | null;
  lastLoginAt: string | null;
  disabledAt: string | null;
  invitedBy: string | null;
  createdBy: string | null;
};

function normalize(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  const e = normalize(email);
  if (!e) return false;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("admin_users")
    .select("email, disabled_at")
    .eq("email", e)
    .maybeSingle();
  if (error || !data) return false;
  return !data.disabled_at;
}

export async function getAdminRecord(
  email: string | null | undefined,
): Promise<AdminRecord | null> {
  const e = normalize(email);
  if (!e) return null;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("admin_users")
    .select(
      "email, created_at, totp_enrolled_at, last_login_at, disabled_at, invited_by, created_by",
    )
    .eq("email", e)
    .maybeSingle();
  if (error || !data) return null;
  return {
    email: data.email as string,
    createdAt: data.created_at as string,
    totpEnrolledAt: (data.totp_enrolled_at as string | null) ?? null,
    lastLoginAt: (data.last_login_at as string | null) ?? null,
    disabledAt: (data.disabled_at as string | null) ?? null,
    invitedBy: (data.invited_by as string | null) ?? null,
    createdBy: (data.created_by as string | null) ?? null,
  };
}

export async function listAdmins(): Promise<AdminRecord[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("admin_users")
    .select(
      "email, created_at, totp_enrolled_at, last_login_at, disabled_at, invited_by, created_by",
    )
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listAdmins: ${error.message}`);
  return (data ?? []).map((r) => ({
    email: r.email as string,
    createdAt: r.created_at as string,
    totpEnrolledAt: (r.totp_enrolled_at as string | null) ?? null,
    lastLoginAt: (r.last_login_at as string | null) ?? null,
    disabledAt: (r.disabled_at as string | null) ?? null,
    invitedBy: (r.invited_by as string | null) ?? null,
    createdBy: (r.created_by as string | null) ?? null,
  }));
}

export async function insertAdmin(email: string, invitedBy: string): Promise<void> {
  const e = normalize(email);
  if (!e) throw new Error("Email obrigatório");
  const inviter = normalize(invitedBy);
  const db = getSupabaseAdmin();
  const { error } = await db.from("admin_users").insert({
    email: e,
    invited_by: inviter,
    created_by: inviter,
  });
  if (error) throw new Error(`insertAdmin: ${error.message}`);
}

export async function setAdminDisabled(email: string, disabled: boolean): Promise<void> {
  const e = normalize(email);
  if (!e) throw new Error("Email obrigatório");
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("admin_users")
    .update({ disabled_at: disabled ? new Date().toISOString() : null })
    .eq("email", e);
  if (error) throw new Error(`setAdminDisabled: ${error.message}`);
}

export async function markAdminLoggedIn(email: string): Promise<void> {
  const e = normalize(email);
  if (!e) return;
  const db = getSupabaseAdmin();
  await db
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("email", e);
}

export async function markAdminTotpEnrolled(email: string): Promise<void> {
  const e = normalize(email);
  if (!e) return;
  const db = getSupabaseAdmin();
  await db
    .from("admin_users")
    .update({ totp_enrolled_at: new Date().toISOString() })
    .eq("email", e);
}

export async function clearAdminTotpEnrolment(email: string): Promise<void> {
  const e = normalize(email);
  if (!e) return;
  const db = getSupabaseAdmin();
  await db.from("admin_users").update({ totp_enrolled_at: null }).eq("email", e);
}
