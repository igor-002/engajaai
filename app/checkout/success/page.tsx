import { SuccessClient } from "./success-client";

export const metadata = { title: "Pagamento" };

type Search = { searchParams: Promise<{ order?: string; pix?: string }> };

export default async function SuccessPage({ searchParams }: Search) {
  const { order, pix } = await searchParams;
  return (
    <section className="container-x max-w-xl py-10 md:py-16">
      <SuccessClient orderId={order ?? null} isPix={pix === "1"} />
    </section>
  );
}
