import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PixIcon } from "@/components/icons/pix";
import { formatBRL, percentOff } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const off = product.originalPriceCents
    ? percentOff(product.originalPriceCents, product.priceCents)
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-[var(--radius)] border border-border bg-card overflow-hidden hover:bg-accent transition-colors"
    >
      <div className="aspect-square w-full bg-muted relative overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 grid place-items-center text-muted-foreground text-xs"
            aria-hidden="true"
          >
            imagem
          </div>
        )}
        {off > 0 && (
          <Badge variant="primary" className="absolute top-2 left-2">
            -{off}% OFF
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-end justify-between gap-2">
          <div>
            {product.originalPriceCents && (
              <p className="text-xs text-muted-foreground line-through font-mono tabular-nums">
                {formatBRL(product.originalPriceCents)}
              </p>
            )}
            <p className="text-lg font-bold font-mono tabular-nums">
              {formatBRL(product.priceCents)}
            </p>
            <p className="text-[11px] text-muted-foreground">À vista no Pix</p>
          </div>
          <span
            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-foreground/5 text-foreground/80"
            aria-label="Pagamento via Pix"
          >
            <PixIcon size={16} />
          </span>
        </div>
        <Button
          size="sm"
          className="w-full pointer-events-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ShoppingCart />
          Comprar agora
        </Button>
      </div>
    </Link>
  );
}
