"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./drawer";

export function CartButton() {
  const count = useCart((s) => s.itemCount());
  const open = useCart((s) => s.open);

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={open}
        aria-label={`Carrinho com ${count} itens`}
        className="relative"
      >
        <ShoppingBag />
        <span className="hidden md:inline">Carrinho</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-foreground text-background text-[10px] font-bold">
            {count}
          </span>
        )}
      </Button>
      <CartDrawer />
    </>
  );
}
