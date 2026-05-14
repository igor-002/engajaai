import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-x max-w-xl py-20 md:py-28 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Página não encontrada</h1>
      <p className="mt-2 text-muted-foreground">A página que você procura não existe ou foi movida.</p>
      <Button asChild className="mt-6">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </section>
  );
}
