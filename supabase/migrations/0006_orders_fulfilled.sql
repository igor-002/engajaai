alter table public.orders
  add column fulfilled boolean not null default false,
  add column fulfilled_at timestamptz;

create index orders_fulfilled_idx on public.orders (fulfilled) where fulfilled = false;
