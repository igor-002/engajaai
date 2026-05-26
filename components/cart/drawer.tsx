"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCart } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, close, items, remove, setQty, subtotalCents } = useCart();
  const subtotal = subtotalCents();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-background border-l border-border flex flex-col data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Dialog.Title className="text-base font-semibold flex items-center gap-2">
              <ShoppingBag size={18} />
              Seu carrinho
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Fechar">
                <X />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-16">
                Seu carrinho está vazio.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 rounded-[var(--radius)] border border-border p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <span
                        className="absolute inset-0 grid place-items-center text-[10px] text-muted-foreground"
                        aria-hidden="true"
                      >
                        img
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                    <p className="text-sm font-mono tabular-nums mt-1">
                      {formatBRL(item.priceCents)}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setQty(item.productId, item.quantity - 1)}
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setQty(item.productId, item.quantity + 1)}
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive"
                        onClick={() => remove(item.productId)}
                        aria-label="Remover item"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold font-mono tabular-nums">{formatBRL(subtotal)}</span>
            </div>
            <Button asChild size="lg" className="w-full" disabled={items.length === 0}>
              <Link href="/checkout" onClick={close}>
                Ir para o checkout
              </Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
