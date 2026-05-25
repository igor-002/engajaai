"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { requireAdminAal2 } from "@/lib/auth/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  insertAdmin,
  setAdminDisabled,
  clearAdminTotpEnrolment,
  getAdminRecord,
} from "@/lib/data/admin";
import { logAdminAction } from "@/lib/auth/audit";
import { env } from "@/lib/env";

const InviteSchema = z.object({ email: z.string().email() });
const EmailSchema = z.object({ email: z.string().email() });

async function origin(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? env.NEXT_PUBLIC_SITE_URL;
}

export async function inviteAdminAction(formData: FormData): Promise<void> {
  const me = await requireAdminAal2();
  const parsed = InviteSchema.parse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });

  const existing = await getAdminRecord(parsed.email);
  if (!existing) {
    await insertAdmin(parsed.email, me.email);
  } else if (existing.disabledAt) {
    await setAdminDisabled(parsed.email, false);
  }

  const adminClient = getSupabaseAdmin();
  const redirectTo = `${await origin()}/admin/set-password`;
  const { error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(parsed.email, {
    redirectTo,
  });
  if (inviteErr) {
    // User likely already exists in Auth — send a recovery email instead.
    const { error: recErr } = await adminClient.auth.resetPasswordForEmail(parsed.email, {
      redirectTo,
    });
    if (recErr) throw new Error(`inviteAdmin: ${recErr.message}`);
  }

  await logAdminAction({
    action: "admin.invite",
    target_table: "admin_users",
    target_id: parsed.email,
    success: true,
  });
  revalidatePath("/admin/team");
}

export async function disableAdminAction(formData: FormData): Promise<void> {
  const me = await requireAdminAal2();
  const parsed = EmailSchema.parse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });
  if (parsed.email === me.email) {
    throw new Error("Você não pode desabilitar a si mesmo");
  }
  await setAdminDisabled(parsed.email, true);
  await logAdminAction({
    action: "admin.disable",
    target_table: "admin_users",
    target_id: parsed.email,
    success: true,
  });
  revalidatePath("/admin/team");
}

export async function enableAdminAction(formData: FormData): Promise<void> {
  await requireAdminAal2();
  const parsed = EmailSchema.parse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });
  await setAdminDisabled(parsed.email, false);
  await logAdminAction({
    action: "admin.enable",
    target_table: "admin_users",
    target_id: parsed.email,
    success: true,
  });
  revalidatePath("/admin/team");
}

export async function resendInviteAction(formData: FormData): Promise<void> {
  await requireAdminAal2();
  const parsed = EmailSchema.parse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });
  const adminClient = getSupabaseAdmin();
  const redirectTo = `${await origin()}/admin/set-password`;
  const { error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(parsed.email, {
    redirectTo,
  });
  if (inviteErr) {
    const { error: recErr } = await adminClient.auth.resetPasswordForEmail(parsed.email, {
      redirectTo,
    });
    if (recErr) throw new Error(`resendInvite: ${recErr.message}`);
  }
  await logAdminAction({
    action: "admin.reset_password",
    target_table: "admin_users",
    target_id: parsed.email,
    success: true,
  });
  revalidatePath("/admin/team");
}

export async function resetTotpAction(formData: FormData): Promise<void> {
  await requireAdminAal2();
  const parsed = EmailSchema.parse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });
  await clearAdminTotpEnrolment(parsed.email);
  await logAdminAction({
    action: "admin.reset_password",
    target_table: "admin_users",
    target_id: parsed.email,
    success: true,
    meta: { reset: "totp" },
  });
  revalidatePath("/admin/team");
}
