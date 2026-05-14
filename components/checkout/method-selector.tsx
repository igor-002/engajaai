"use client";

import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PixIcon } from "@/components/icons/pix";
import type { PaymentMethodKey } from "@/types";

type Method = {
  key: PaymentMethodKey;
  label: string;
  hint: string;
  badge?: string;
  disabled?: boolean;
};

const METHODS: Method[] = [
  { key: "pix", label: "Pix", hint: "Aprovação imediata", badge: "Mais rápido" },
  { key: "card", label: "Cartão de crédito", hint: "Em breve", disabled: true },
];

export function MethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethodKey;
  onChange: (m: PaymentMethodKey) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {METHODS.map((m) => {
        const active = value === m.key;
        return (
          <button
            key={m.key}
            type="button"
            disabled={m.disabled}
            onClick={() => onChange(m.key)}
            className={cn(
              "text-left rounded-[var(--radius)] border p-4 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-accent",
              m.disabled && "opacity-50 cursor-not-allowed hover:bg-card",
            )}
            aria-pressed={active}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
                aria-hidden="true"
              >
                {m.key === "pix" ? <PixIcon size={16} /> : "💳"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{m.label}</span>
                  {m.badge && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <Clock size={10} />
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{m.hint}</p>
              </div>
              {active && <Check size={16} className="text-primary mt-1" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
