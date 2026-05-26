import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Zap, CreditCard, Package, Headphones } from "lucide-react";
import { getProductBySlug, getCategoryBySlug } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DetailActions } from "@/components/product/detail-actions";
import { PixIcon } from "@/components/icons/pix";
import { formatBRL, percentOff } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Produto",
    description: product?.description,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const category = await getCategoryBySlug(product.categorySlug);
  const off = product.originalPriceCents
    ? percentOff(product.originalPriceCents, product.priceCents)
    : 0;

  return (
    <section className="container-x py-8 md:py-12">
      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          <li><Link href="/" className="hover:text-foreground">Início</Link></li>
          <li aria-hidden="true"><ChevronRight size={14} /></li>
          {category && (
            <>
              <li>
                <Link href={`/category/${category.slug}`} className="hover:text-foreground">
                  {category.name}
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
            </>
          )}
          <li className="text-foreground line-clamp-1" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius)] border border-border bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
                imagem do produto
              </div>
            )}
          </div>
        </div>

        {/* Info + CTA */}
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="default" className="border-success/30 text-[color:hsl(142_71%_55%)]">
              {product.stock > 0 ? `${product.stock} em estoque` : "Indisponível"}
            </Badge>
            <span className="inline-flex items-center gap-1">
              <Package size={14} />
              Entrega {product.deliveryMode === "auto" ? "automática" : "manual"}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
            {product.name}
          </h1>

          <div className="space-y-1">
            {product.originalPriceCents && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground line-through font-mono tabular-nums">
                  {formatBRL(product.originalPriceCents)}
                </p>
                {off > 0 && <Badge variant="primary">-{off}% OFF</Badge>}
              </div>
            )}
            <p className="text-3xl md:text-4xl font-bold font-mono tabular-nums">
              {formatBRL(product.priceCents)}
            </p>
            <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <PixIcon size={14} /> À vista no Pix
            </p>
          </div>

          <DetailActions product={product} />

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TrustCard icon={<Zap size={16} />} title="Entrega imediata" body="Após confirmação do pagamento." />
            <TrustCard icon={<ShieldCheck size={16} />} title="Pagamento seguro" body="Criptografia ponta-a-ponta." />
            <TrustCard icon={<CreditCard size={16} />} title="Pagamento via Pix" body="Aprovação instantânea." />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 max-w-3xl">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3">Descrição</h2>
        <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {product.description}
        </div>

        <div className="mt-8 rounded-[var(--radius)] border border-border p-5 flex items-start gap-3 bg-muted/30">
          <Headphones size={18} className="text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Dúvidas antes de comprar?</p>
            <p className="text-sm text-muted-foreground">
              Nosso time responde via{" "}
              <a
                href="https://wa.me/0000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                WhatsApp
              </a>{" "}
              24/7.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-border p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
