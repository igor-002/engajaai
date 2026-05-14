import type { Category, Product } from "@/types";

export const CATEGORIES: Category[] = [
  { id: "c-meta", slug: "meta-ads", name: "Meta Ads", description: "Contas e perfis para Facebook & Instagram Ads." },
  { id: "c-google", slug: "google-ads", name: "Google Ads", description: "Contas Google Ads BR e USD." },
  { id: "c-tiktok", slug: "tiktok-ads", name: "TikTok Ads", description: "Contas e Business Centers TikTok." },
  { id: "c-proxys", slug: "proxys", name: "Proxys", description: "Proxies residenciais e dedicados." },
  { id: "c-variados", slug: "variados", name: "Variados", description: "Ferramentas e utilitários diversos." },
];

const placeholder = (i: number) => undefined;

export const PRODUCTS: Product[] = [
  {
    id: "p-meta-bm",
    slug: "bm-meta-verificada-limite-50",
    name: "BM Meta Verificada — Limite USD 50",
    description: "Business Manager verificada com gerenciador pronto para campanhas. Inclui acesso administrativo e suporte de aquecimento.",
    priceCents: 18990,
    categorySlug: "meta-ads",
    stock: 7,
    paymentMethods: ["pix"],
    deliveryMode: "auto",
    featured: true,
    imageUrl: placeholder(1),
  },
  {
    id: "p-meta-bm-pro",
    slug: "bm-meta-verificada-pro",
    name: "BM Meta Verificada — Plano Pro",
    description: "BM com limite estendido, perfil aquecido e fanpage anexada. Indicado para escalada de campanhas.",
    priceCents: 34990,
    originalPriceCents: 39990,
    categorySlug: "meta-ads",
    stock: 3,
    paymentMethods: ["pix"],
    deliveryMode: "auto",
    featured: true,
  },
  {
    id: "p-google-cnpj-auto",
    slug: "conta-google-ads-cnpj-automatico",
    name: "Conta Google Ads CNPJ — Pagamento Automático",
    description: "Conta Google Ads verificada vinculada a CNPJ próprio, configurada para cobrança automática no cartão.",
    priceCents: 22990,
    categorySlug: "google-ads",
    stock: 12,
    paymentMethods: ["pix"],
    deliveryMode: "auto",
    featured: true,
  },
  {
    id: "p-google-cnpj-manual",
    slug: "conta-google-ads-cnpj-manual",
    name: "Conta Google Ads CNPJ — Pagamento Manual",
    description: "Conta Google Ads CNPJ com recarga manual via PIX direto no painel.",
    priceCents: 15990,
    categorySlug: "google-ads",
    stock: 9,
    paymentMethods: ["pix"],
    deliveryMode: "auto",
  },
  {
    id: "p-google-usd",
    slug: "conta-google-ads-dolar",
    name: "Conta Google Ads USD — CNPJ",
    description: "Conta dolarizada para campanhas internacionais. Cobrança automática habilitada.",
    priceCents: 27990,
    originalPriceCents: 34990,
    categorySlug: "google-ads",
    stock: 4,
    paymentMethods: ["pix"],
    deliveryMode: "auto",
    featured: true,
  },
  {
    id: "p-tiktok-bc",
    slug: "tiktok-business-center-br",
    name: "TikTok Business Center BR",
    description: "Business Center com conta de anúncios pronta para vincular pixels e campanhas.",
    priceCents: 19990,
    categorySlug: "tiktok-ads",
    stock: 6,
    paymentMethods: ["pix"],
    deliveryMode: "auto",
  },
  {
    id: "p-proxy-res",
    slug: "proxy-residencial-br-30d",
    name: "Proxy Residencial BR — 30 dias",
    description: "IP residencial brasileiro dedicado, ideal para manter sessão limpa em contas de anúncio.",
    priceCents: 7990,
    categorySlug: "proxys",
    stock: 25,
    paymentMethods: ["pix"],
    deliveryMode: "auto",
  },
  {
    id: "p-var-antidetect",
    slug: "kit-antidetect-licenca-30d",
    name: "Licença Antidetect — 30 dias",
    description: "Acesso a navegador antidetect compatível com isolamento de perfis publicitários.",
    priceCents: 12990,
    categorySlug: "variados",
    stock: 15,
    paymentMethods: ["pix"],
    deliveryMode: "manual",
  },
];

export function getCategories(): Category[] {
  return CATEGORIES;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.categorySlug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function searchProducts(q: string): Product[] {
  const term = q.toLowerCase().trim();
  if (!term) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term),
  );
}
