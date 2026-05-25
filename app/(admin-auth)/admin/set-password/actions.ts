"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/data/admin";

const Schema = z.object({
  password: z.string().min(10, "Mínimo 10 caracteres"),
});

export async function setNewPassword(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = Schema.safeParse({ password: String(formData.get("password") ?? "") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Senha inválida" };
  }
  const supa = await createSupabaseServerClient();
  if (!supa) return { ok: false, error: "Auth indisponível" };

  const { data: userData } = await supa.auth.getUser();
  const email = userData.user?.email?.toLowerCase();
  if (!email) return { ok: false, error: "Sessão inválida. Solicite um novo link." };

  // Hard guard: only admins can use this page. If invite/reset was misdirected, reject.
  if (!(await isAdminEmail(email))) {
    return { ok: false, error: "Email não autorizado" };
  }

  const { error } = await supa.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
