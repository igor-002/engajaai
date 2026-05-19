"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./drawer";

export function CartButton() {
  const count = useCart((s) => s.itemCount());
  const open = useCart((s) => s.open);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayCount = mounted ? count : 0;

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={open}
        aria-label={`Carrinho com ${displayCount} itens`}
        className="relative"
      >
        <ShoppingBag />
        <span className="hidden md:inline">Carrinho</span>
        {displayCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-foreground text-background text-[10px] font-bold">
            {displayCount}
          </span>
        )}
      </Button>
      <CartDrawer />
    </>
  );
}
