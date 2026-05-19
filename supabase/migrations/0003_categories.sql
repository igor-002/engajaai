create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index categories_slug_idx on public.categories (slug);
create index categories_sort_idx on public.categories (sort_order, name);

alter table public.categories enable row level security;
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

insert into public.categories (slug, name, description, sort_order) values
  ('meta-ads', 'Meta Ads', 'Contas e perfis para Facebook & Instagram Ads.', 1),
  ('google-ads', 'Google Ads', 'Contas Google Ads BR e USD.', 2),
  ('tiktok-ads', 'TikTok Ads', 'Contas e Business Centers TikTok.', 3),
  ('proxys', 'Proxys', 'Proxies residenciais e dedicados.', 4),
  ('variados', 'Variados', 'Ferramentas e utilitários diversos.', 5);
