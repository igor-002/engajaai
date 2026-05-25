"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminEmail, getAdminRecord } from "@/lib/data/admin";
import { logAdminAction } from "@/lib/auth/audit";
import { env } from "@/lib/env";

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignInResult =
  | { ok: true; nextPath: string }
  | { ok: false; error: string };

/**
 * Pre-flight: confirm the email is a non-disabled admin BEFORE attempting password sign-in.
 * Prevents leaking timing or error info about non-admin accounts.
 */
async function requireAdminBeforeAuth(email: string): Promise<
  { ok: true } | { ok: false; reason: "not_admin" | "disabled" }
> {
  const rec = await getAdminRecord(email);
  if (!rec) return { ok: false, reason: "not_admin" };
  if (rec.disabledAt) return { ok: false, reason: "disabled" };
  return { ok: true };
}

export async function signInAdmin(formData: FormData): Promise<SignInResult> {
  const parsed = SignInSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { ok: false, error: "Email ou senha inválidos" };
  const { email, password } = parsed.data;

  const pre = await requireAdminBeforeAuth(email);
  if (!pre.ok) {
    await logAdminAction({
      action: pre.reason === "disabled" ? "login.denied_disabled" : "login.denied_not_admin",
      success: false,
      emailOverride: email,
    });
    return { ok: false, error: "Credenciais inválidas" };
  }

  const supa = await createSupabaseServerClient();
  if (!supa) return { ok: false, error: "Auth indisponível" };

  const { error } = await supa.auth.signInWithPassword({ email, password });
  if (error) {
    await logAdminAction({
      action: "login.failure",
      success: false,
      emailOverride: email,
      meta: { message: error.message },
    });
    return { ok: false, error: "Credenciais inválidas" };
  }

  await logAdminAction({
    action: "login.success",
    success: true,
    emailOverride: email,
  });

  // Middleware will redirect to /admin/mfa/enroll or /admin/mfa/challenge if needed.
  const nextRaw = String(formData.get("next") ?? "/admin");
  const nextPath = nextRaw.startsWith("/admin") ? nextRaw : "/admin";
  return { ok: true, nextPath };
}

const ResetSchema = z.object({ email: z.string().email() });

export async function requestPasswordReset(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const parsed = ResetSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });
  if (!parsed.success) return { ok: false, error: "Email inválido" };
  const { email } = parsed.data;

  // Only allow reset emails for known admin addresses to avoid using this as an admin-enumeration probe.
  if (!(await isAdminEmail(email))) {
    // Return success-shaped to avoid leaking which emails are admins.
    return { ok: true };
  }

  const supa = await createSupabaseServerClient();
  if (!supa) return { ok: false, error: "Auth indisponível" };

  const h = await headers();
  const origin = h.get("origin") ?? env.NEXT_PUBLIC_SITE_URL;
  const { error } = await supa.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/admin/set-password`,
  });
  if (error) return { ok: false, error: error.message };

  await logAdminAction({
    action: "admin.reset_password",
    success: true,
    emailOverride: email,
  });
  return { ok: true };
}

/**
 * Bootstrap helper: invite admin (creates auth user if needed + sends invite email).
 * For seeded admins (in admin_users but no auth user yet) and for first-time onboarding.
 */
export async function inviteExistingAdmin(email: string): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const e = email.trim().toLowerCase();
  if (!(await isAdminEmail(e))) return { ok: false, error: "Email não está em admin_users" };

  const adminClient = getSupabaseAdmin();
  const h = await headers();
  const origin = h.get("origin") ?? env.NEXT_PUBLIC_SITE_URL;

  const { error } = await adminClient.auth.admin.inviteUserByEmail(e, {
    redirectTo: `${origin}/admin/set-password`,
  });
  if (error) {
    // If the user already exists, fall back to a recovery (password reset) email.
    const recovery = await adminClient.auth.resetPasswordForEmail(e, {
      redirectTo: `${origin}/admin/set-password`,
    });
    if (recovery.error) return { ok: false, error: recovery.error.message };
  }
  return { ok: true };
}
