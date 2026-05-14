"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CouponInput({
  onApply,
}: {
  onApply: (code: string) => Promise<boolean>;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function apply() {
    if (!code.trim()) return;
    const ok = await onApply(code.trim());
    setStatus(ok ? "ok" : "err");
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setStatus("idle");
          }}
          placeholder="Digite seu cupom"
          aria-label="Cupom de desconto"
        />
        <Button type="button" variant="secondary" onClick={apply} disabled={!code}>
          <Ticket />
          Aplicar
        </Button>
      </div>
      {status === "ok" && (
        <p className="text-xs text-[color:hsl(142_71%_55%)]" role="status">
          Cupom aplicado.
        </p>
      )}
      {status === "err" && (
        <p className="text-xs text-destructive" role="alert">
          Cupom inválido ou expirado.
        </p>
      )}
    </div>
  );
}
