import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminRecord, type AdminRecord } from "@/lib/data/admin";
import { env } from "@/lib/env";

export type AdminGuardResult = {
  email: string;
  aal: "aal1" | "aal2";
  hasTotp: boolean;
  adminRow: AdminRecord;
};

export class AdminGuardError extends Error {
  code:
    | "no_session"
    | "not_admin"
    | "disabled"
    | "supabase_unavailable"
    | "mfa_required";
  constructor(
    code: AdminGuardError["code"],
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

/**
 * Returns the auth state required to render or mutate admin resources.
 * Throws AdminGuardError for any failure mode — callers translate to the right UI/HTTP response.
 *
 * `requireAal2`: when true (or when ADMIN_MFA_ENFORCED + user has TOTP enrolled),
 * the call fails unless the session was elevated via MFA.
 */
export async function assertAdmin(opts: { requireAal2?: boolean } = {}): Promise<AdminGuardResult> {
  const supa = await createSupabaseServerClient();
  if (!supa) throw new AdminGuardError("supabase_unavailable", "Supabase indisponível");

  const { data: userData } = await supa.auth.getUser();
  const user = userData.user;
  if (!user) throw new AdminGuardError("no_session", "Sessão necessária");

  const adminRow = await getAdminRecord(user.email);
  if (!adminRow) throw new AdminGuardError("not_admin", "Acesso negado");
  if (adminRow.disabledAt) throw new AdminGuardError("disabled", "Acesso desabilitado");

  // currentLevel reports the active session's AAL. We require aal2 when enforced.
  let aal: "aal1" | "aal2" = "aal1";
  try {
    const { data: aalData } = await supa.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === "aal2") aal = "aal2";
  } catch {
    // Fall back to aal1 — defense-in-depth: missing info means treat as low.
  }

  const hasTotp = !!adminRow.totpEnrolledAt;
  const mustHaveAal2 = !!opts.requireAal2 || (env.ADMIN_MFA_ENFORCED && hasTotp);
  if (mustHaveAal2 && aal !== "aal2") {
    throw new AdminGuardError("mfa_required", "MFA necessário");
  }

  return {
    email: adminRow.email,
    aal,
    hasTotp,
    adminRow,
  };
}

/** Helper for server actions: enforces full aal2 + admin membership. */
export async function requireAdminAal2(): Promise<AdminGuardResult> {
  return assertAdmin({ requireAal2: env.ADMIN_MFA_ENFORCED });
}
