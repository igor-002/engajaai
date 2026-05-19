create extension if not exists "pgcrypto";

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text not null,
  customer_tax_id text,
  customer_cellphone text,
  items jsonb not null,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  payment_provider text not null check (payment_provider in ('abacate', 'stripe')),
  payment_method text not null check (payment_method in ('pix', 'card')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'expired', 'refunded')),
  external_payment_id text unique,
  pix_code text,
  pix_qr_code_url text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_email_idx on public.orders (email);
create index orders_user_id_idx on public.orders (user_id);
create index orders_external_payment_id_idx on public.orders (external_payment_id);
create index orders_created_at_idx on public.orders (created_at desc);

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() is not null and auth.uid() = user_id);
