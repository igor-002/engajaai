"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    const supa = createSupabaseBrowserClient();
    if (!supa) return;
    setLoading(true);
    await supa.auth.signOut();
    router.refresh();
  }

  return (
    <Button variant="secondary" size="sm" onClick={onClick} disabled={loading}>
      <LogOut />
      {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}
