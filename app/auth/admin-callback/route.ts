import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/data/admin";
import { logAdminAction } from "@/lib/auth/audit";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/admin";
  const next = nextRaw.startsWith("/admin") ? nextRaw : "/admin";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=oauth`);
  }

  const supa = await createSupabaseServerClient();
  if (!supa) {
    return NextResponse.redirect(`${origin}/admin/login?error=oauth`);
  }

  const { error } = await supa.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/admin/login?error=oauth`);
  }

  const { data } = await supa.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !(await isAdminEmail(email))) {
    await logAdminAction({
      action: "login.denied_not_admin",
      success: false,
      emailOverride: email ?? "unknown",
      meta: { provider: "google" },
    });
    await supa.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/login?error=not_admin`);
  }

  await logAdminAction({
    action: "login.success",
    success: true,
    emailOverride: email,
    meta: { provider: "google" },
  });

  return NextResponse.redirect(`${origin}${next}`);
}
