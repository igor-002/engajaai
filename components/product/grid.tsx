import type { Product } from "@/types";
import { ProductCard } from "./card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-dashed border-border p-10 text-center text-muted-foreground">
        Nenhum produto disponível nesta categoria no momento.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
