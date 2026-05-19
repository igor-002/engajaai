import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { linkOrphanOrdersByEmail } from "@/lib/data/orders";

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
          if (data.user?.email && data.user.id) {
            await linkOrphanOrdersByEmail(data.user.id, data.user.email);
          }
        } catch (e) {
          console.error("[auth-callback] link orphans failed", e);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
