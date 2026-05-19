create table public.webhook_events (
  id text primary key,
  event_type text not null,
  external_payment_id text,
  order_id uuid references public.orders(id) on delete set null,
  raw_payload jsonb not null,
  dev_mode boolean not null default false,
  received_at timestamptz not null default now()
);

create index webhook_events_external_payment_id_idx on public.webhook_events (external_payment_id);
create index webhook_events_received_at_idx on public.webhook_events (received_at desc);

alter table public.webhook_events enable row level security;
