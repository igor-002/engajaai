"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail, markAdminTotpEnrolled } from "@/lib/data/admin";
import { logAdminAction } from "@/lib/auth/audit";

export async function verifyEnrollment(
  factorId: string,
  challengeId: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supa = await createSupabaseServerClient();
  if (!supa) return { ok: false, error: "Auth indisponível" };

  const { data: userData } = await supa.auth.getUser();
  const email = userData.user?.email?.toLowerCase();
  if (!email || !(await isAdminEmail(email))) {
    return { ok: false, error: "Acesso negado" };
  }

  const { error } = await supa.auth.mfa.verify({
    factorId,
    challengeId,
    code: code.trim(),
  });
  if (error) {
    await logAdminAction({
      action: "mfa.verify_fail",
      success: false,
      emailOverride: email,
      meta: { stage: "enroll", message: error.message },
    });
    return { ok: false, error: "Código inválido" };
  }

  await markAdminTotpEnrolled(email);
  await logAdminAction({
    action: "mfa.enroll",
    success: true,
    emailOverride: email,
  });
  return { ok: true };
}

export async function unenrollFactor(factorId: string): Promise<void> {
  const supa = await createSupabaseServerClient();
  if (!supa) return;
  try {
    await supa.auth.mfa.unenroll({ factorId });
  } catch {
    /* best effort */
  }
}
