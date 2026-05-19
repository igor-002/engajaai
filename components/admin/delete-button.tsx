"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  label = "Excluir",
  confirmText = "Tem certeza?",
  action,
}: {
  label?: string;
  confirmText?: string;
  action: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  async function onClick() {
    if (!confirm(confirmText)) return;
    setLoading(true);
    try {
      await action();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
      setLoading(false);
    }
  }
  return (
    <Button variant="secondary" size="sm" onClick={onClick} disabled={loading}>
      <Trash2 size={14} />
      {loading ? "..." : label}
    </Button>
  );
}
