"use server";

import { isAdminEmail } from "@/lib/data/admin";

/** Returns true if the email belongs to an admin and should be redirected to /admin/login. */
export async function checkAdminEmail(email: string): Promise<boolean> {
  return isAdminEmail(email);
}
