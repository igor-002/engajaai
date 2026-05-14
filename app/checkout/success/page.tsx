import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Pagamento confirmado" };

type Search = { searchParams: Promise<{ order?: string }> };

export default async function SuccessPage({ searchParams }: Search) {
  const { order } = await searchParams;

  return (
    <section className="container-x max-w-xl py-16 md:py-24 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-[color:hsl(142_71%_55%)] mb-4">
        <CheckCircle2 size={28} />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pedido recebido!</h1>
      <p className="mt-2 text-muted-foreground">
        {order ? <>Pedido <span className="font-mono">#{order.slice(0, 8)}</span> registrado.</> : "Seu pedido foi registrado."}
        {" "}Assim que o pagamento for confirmado, enviaremos o produto por email.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/account">Ver meus pedidos</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Continuar comprando</Link>
        </Button>
      </div>
    </section>
  );
}
