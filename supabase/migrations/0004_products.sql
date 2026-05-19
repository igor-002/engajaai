create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  original_price_cents integer check (original_price_cents is null or original_price_cents >= price_cents),
  image_url text,
  category_id uuid not null references public.categories(id) on delete restrict,
  stock integer not null default 0 check (stock >= 0),
  payment_methods text[] not null default array['pix']::text[],
  delivery_mode text not null default 'auto' check (delivery_mode in ('auto', 'manual')),
  featured boolean not null default false,
  abacate_product_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_slug_idx on public.products (slug);
create index products_category_idx on public.products (category_id);
create index products_featured_idx on public.products (featured) where featured = true;
create index products_search_idx on public.products using gin (to_tsvector('portuguese', name || ' ' || description));

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (true);

insert into public.products
  (slug, name, description, price_cents, original_price_cents, category_id, stock, payment_methods, delivery_mode, featured)
select s.slug, s.name, s.description, s.price_cents, s.original_price_cents,
       c.id, s.stock, s.payment_methods, s.delivery_mode, s.featured
from (values
  (
    'bm-meta-verificada-limite-50',
    'BM Meta Verificada — Limite USD 50',
    'Business Manager verificada com gerenciador pronto para campanhas. Inclui acesso administrativo e suporte de aquecimento.',
    18990, null::int, 'meta-ads', 7, array['pix']::text[], 'auto', true
  ),
  (
    'bm-meta-verificada-pro',
    'BM Meta Verificada — Plano Pro',
    'BM com limite estendido, perfil aquecido e fanpage anexada. Indicado para escalada de campanhas.',
    34990, 39990, 'meta-ads', 3, array['pix']::text[], 'auto', true
  ),
  (
    'conta-google-ads-cnpj-automatico',
    'Conta Google Ads CNPJ — Pagamento Automático',
    'Conta Google Ads verificada vinculada a CNPJ próprio, configurada para cobrança automática no cartão.',
    22990, null::int, 'google-ads', 12, array['pix']::text[], 'auto', true
  ),
  (
    'conta-google-ads-cnpj-manual',
    'Conta Google Ads CNPJ — Pagamento Manual',
    'Conta Google Ads CNPJ com recarga manual via PIX direto no painel.',
    15990, null::int, 'google-ads', 9, array['pix']::text[], 'auto', false
  ),
  (
    'conta-google-ads-dolar',
    'Conta Google Ads USD — CNPJ',
    'Conta dolarizada para campanhas internacionais. Cobrança automática habilitada.',
    27990, 34990, 'google-ads', 4, array['pix']::text[], 'auto', true
  ),
  (
    'tiktok-business-center-br',
    'TikTok Business Center BR',
    'Business Center com conta de anúncios pronta para vincular pixels e campanhas.',
    19990, null::int, 'tiktok-ads', 6, array['pix']::text[], 'auto', false
  ),
  (
    'proxy-residencial-br-30d',
    'Proxy Residencial BR — 30 dias',
    'IP residencial brasileiro dedicado, ideal para manter sessão limpa em contas de anúncio.',
    7990, null::int, 'proxys', 25, array['pix']::text[], 'auto', false
  ),
  (
    'kit-antidetect-licenca-30d',
    'Licença Antidetect — 30 dias',
    'Acesso a navegador antidetect compatível com isolamento de perfis publicitários.',
    12990, null::int, 'variados', 15, array['pix']::text[], 'manual', false
  )
) as s(slug, name, description, price_cents, original_price_cents, category_slug, stock, payment_methods, delivery_mode, featured)
join public.categories c on c.slug = s.category_slug;
