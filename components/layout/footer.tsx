import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { BrandMark } from "@/components/icons/brand";
import { getCategories } from "@/lib/data";

export async function Footer() {
  const year = new Date().getFullYear();
  const categories = (await getCategories().catch(() => [])).slice(0, 6);
  return (
    <footer className="border-t border-border mt-16">
      <div className="container-x py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size={28} />
            <span className="text-base font-bold tracking-tight">EngajaAI</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Sua agência de mídia paga, completa. Contas verificadas, proxies e infraestrutura para escalar campanhas.
          </p>
          <p className="text-xs text-muted-foreground">CNPJ 00.000.000/0001-00 — EngajaAI Ltda.</p>
        </div>

        <nav aria-label="Links rápidos" className="space-y-2">
          <h3 className="text-sm font-semibold">Loja</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {categories.length > 0 ? (
              categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="hover:text-foreground">
                    {c.name}
                  </Link>
                </li>
              ))
            ) : (
              <li><Link href="/" className="hover:text-foreground">Ver produtos</Link></li>
            )}
          </ul>
        </nav>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Atendimento</h3>
          <div className="flex items-center gap-2">
            <Link
              href="https://instagram.com/engajaai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 w-10 rounded-[var(--radius)] border border-border hover:bg-accent transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </Link>
            <Link
              href="https://wa.me/0000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 w-10 rounded-[var(--radius)] border border-border hover:bg-accent transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">Suporte 24/7 via WhatsApp.</p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-x py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {year} EngajaAI. Todos os direitos reservados.</p>
          <Link href="/terms" className="hover:text-foreground">Termos e condições</Link>
        </div>
      </div>
    </footer>
  );
}
