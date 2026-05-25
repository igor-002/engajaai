import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const ADMIN_PUBLIC_PATHS = new Set([
  "/admin/login",
  "/admin/set-password",
]);

const ADMIN_MFA_PATHS = new Set([
  "/admin/mfa/enroll",
  "/admin/mfa/challenge",
]);

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function redirect(req: NextRequest, target: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = target.split("?")[0];
  url.search = target.includes("?") ? target.slice(target.indexOf("?")) : "";
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const path = request.nextUrl.pathname;
  if (!isAdminPath(path)) return response;
  if (ADMIN_PUBLIC_PATHS.has(path)) return response;

  if (!user) {
    const next = encodeURIComponent(path);
    return redirect(request, `/admin/login?next=${next}`);
  }

  const emailLc = (user.email ?? "").toLowerCase();
  // Authenticated user can self-read their admin_users row via RLS (admin_users_self_read).
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("email, totp_enrolled_at, disabled_at")
    .eq("email", emailLc)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    return redirect(request, "/admin/login?error=not_admin");
  }
  if (adminRow.disabled_at) {
    await supabase.auth.signOut();
    return redirect(request, "/admin/login?error=disabled");
  }

  if (env.ADMIN_MFA_ENFORCED) {
    const hasTotp = !!adminRow.totp_enrolled_at;
    let aal: "aal1" | "aal2" = "aal1";
    try {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal2") aal = "aal2";
    } catch {
      /* keep aal1 */
    }

    if (!hasTotp && path !== "/admin/mfa/enroll") {
      return redirect(request, "/admin/mfa/enroll");
    }
    if (hasTotp && aal !== "aal2" && path !== "/admin/mfa/challenge" && !ADMIN_MFA_PATHS.has(path)) {
      return redirect(request, "/admin/mfa/challenge");
    }
  }

  return response;
}
