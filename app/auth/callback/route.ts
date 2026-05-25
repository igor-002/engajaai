import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { linkOrphanOrdersByEmail } from "@/lib/data/orders";
import { isAdminEmail } from "@/lib/data/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supa = await createSupabaseServerClient();
    if (supa) {
      const { error } = await supa.auth.exchangeCodeForSession(code);
      if (!error) {
        try {
          const { data } = await supa.auth.getUser();
          const email = data.user?.email;
          if (email && (await isAdminEmail(email))) {
            // Admin email cannot use the public passwordless flow — force the dedicated login.
            await supa.auth.signOut();
            return NextResponse.redirect(`${origin}/admin/login?error=use_admin_login`);
          }
          if (email && data.user?.id) {
            await linkOrphanOrdersByEmail(data.user.id, email);
          }
        } catch (e) {
          console.error("[auth-callback] post-auth handler failed", e);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
