import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/data/admin";

export async function GET() {
  const supa = await createSupabaseServerClient();
  if (!supa) return NextResponse.json({ user: null });
  const { data } = await supa.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ user: null });
  const admin = await isAdminEmail(user.email);
  return NextResponse.json({
    user: { id: user.id, email: user.email },
    isAdmin: admin,
  });
}
