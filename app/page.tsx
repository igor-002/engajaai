import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Zap, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/grid";
import { getCategories, getFeaturedProducts } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="container-x py-12 md:py-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
            Sua agência de mídia paga,{" "}
            <span className="text-primary">completa.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl">
            Contas verificadas, proxies e ferramentas para você escalar campanhas no Meta, Google e TikTok com segurança e suporte 24/7.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="#produtos">
                Ver produtos <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="https://wa.me/0000000000" target="_blank" rel="noopener noreferrer">
                <MessageCircle />
                Falar com suporte
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-muted/40">
        <div className="container-x py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Feature icon={<Zap size={18} />} title="Entrega imediata" body="Receba seu produto logo após a confirmação do pagamento." />
          <Feature icon={<ShieldCheck size={18} />} title="Segurança total" body="Pagamento via Pix com criptografia ponta-a-ponta." />
          <Feature icon={<Headphones size={18} />} title="Suporte 24/7" body="Atendimento humano por WhatsApp, todos os dias." />
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          Categorias populares
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-4 hover:bg-accent transition-colors"
            >
              <div
                className="h-16 w-16 rounded-full bg-muted grid place-items-center text-muted-foreground"
                aria-hidden="true"
              >
                <span className="text-xs">{c.name.slice(0, 1)}</span>
              </div>
              <span className="text-sm font-medium text-center">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section id="produtos" className="container-x py-8 md:py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Em destaque</h2>
          <Link
            href="/category/google-ads"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
      </div>
    </div>
  );
}
