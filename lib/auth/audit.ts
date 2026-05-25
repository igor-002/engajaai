import "server-only";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminAction =
  | "login.success"
  | "login.failure"
  | "login.denied_not_admin"
  | "login.denied_disabled"
  | "mfa.enroll"
  | "mfa.verify_fail"
  | "mfa.verify_success"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "category.create"
  | "category.update"
  | "category.delete"
  | "order.fulfill"
  | "order.update_status"
  | "admin.invite"
  | "admin.disable"
  | "admin.enable"
  | "admin.reset_password";

type LogInput = {
  action: AdminAction;
  target_table?: string;
  target_id?: string;
  success: boolean;
  meta?: Record<string, unknown>;
  /** Override admin_email when the user is not yet authenticated (e.g. pre-auth login failures). */
  emailOverride?: string;
};

function firstIp(forwardedFor: string | null | undefined): string | null {
  if (!forwardedFor) return null;
  const ip = forwardedFor.split(",")[0]?.trim();
  return ip || null;
}

async function resolveEmail(override?: string): Promise<string | null> {
  if (override) return override.trim().toLowerCase();
  try {
    const supa = await createSupabaseServerClient();
    if (!supa) return null;
    const { data } = await supa.auth.getUser();
    return data.user?.email?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export async function logAdminAction(input: LogInput): Promise<void> {
  try {
    const email = await resolveEmail(input.emailOverride);
    if (!email) return; // Cannot attribute — skip rather than corrupt the log.

    const h = await headers();
    const ip = firstIp(h.get("x-forwarded-for")) ?? h.get("x-real-ip");
    const userAgent = h.get("user-agent");

    const db = getSupabaseAdmin();
    await db.from("admin_audit_log").insert({
      admin_email: email,
      action: input.action,
      target_table: input.target_table ?? null,
      target_id: input.target_id ?? null,
      ip,
      user_agent: userAgent,
      success: input.success,
      meta: input.meta ?? null,
    });
  } catch (e) {
    // Audit logging must never break the user-facing action.
    console.error("[audit] failed to log admin action", e);
  }
}
