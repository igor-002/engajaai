"use client";

import { useState } from "react";
import { CheckCircle2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FulfillButton({
  fulfilled,
  action,
}: {
  fulfilled: boolean;
  action: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  async function onClick() {
    setLoading(true);
    try {
      await action();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
      setLoading(false);
    }
  }
  return (
    <Button variant={fulfilled ? "secondary" : "primary"} size="sm" onClick={onClick} disabled={loading}>
      {fulfilled ? <Undo2 size={14} /> : <CheckCircle2 size={14} />}
      {loading ? "..." : fulfilled ? "Reabrir" : "Entregue"}
    </Button>
  );
}
