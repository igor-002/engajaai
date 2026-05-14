import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductGrid } from "@/components/product/grid";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/data";
import type { Metadata } from "next";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category?.name ?? "Categoria",
    description: category?.description,
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getProductsByCategory(slug);

  return (
    <section className="container-x py-8 md:py-12">
      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">Início</Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li className="text-foreground" aria-current="page">{category.name}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground max-w-2xl">{category.description}</p>
        )}
      </header>

      <ProductGrid products={products} />
    </section>
  );
}
