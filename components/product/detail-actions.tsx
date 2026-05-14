"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/store";

export function DetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);

  function buyNow() {
    add(product, 1);
    router.push("/checkout");
  }

  function addToCart() {
    add(product, 1);
    open();
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        size="lg"
        className="flex-1"
        onClick={buyNow}
        disabled={outOfStock}
      >
        <Zap />
        {outOfStock ? "Indisponível" : "Comprar agora"}
      </Button>
      <Button
        variant="secondary"
        size="lg"
        className="flex-1"
        onClick={addToCart}
        disabled={outOfStock}
      >
        <ShoppingCart />
        Adicionar ao carrinho
      </Button>
    </div>
  );
}
