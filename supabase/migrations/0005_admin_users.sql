create table public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "admin_users_self_read"
  on public.admin_users for select
  to authenticated
  using (auth.jwt() ->> 'email' = email);

insert into public.admin_users (email) values ('igorsoare3@gmail.com')
on conflict (email) do nothing;
