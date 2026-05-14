import { ProductGrid } from "@/components/product/grid";
import { searchProducts } from "@/lib/data";

type Search = { searchParams: Promise<{ q?: string }> };

export const metadata = { title: "Buscar" };

export default async function SearchPage({ searchParams }: Search) {
  const { q = "" } = await searchParams;
  const results = q ? await searchProducts(q) : [];

  return (
    <section className="container-x py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        Buscar: <span className="text-muted-foreground">{q || "—"}</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        {results.length} resultado{results.length === 1 ? "" : "s"}
      </p>
      <div className="mt-8">
        <ProductGrid products={results} />
      </div>
    </section>
  );
}
