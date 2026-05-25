-- Normalize existing admin emails to lowercase + enforce
update public.admin_users set email = lower(trim(email));
alter table public.admin_users
  add constraint admin_users_email_lowercase check (email = lower(email));

-- Admin row state: MFA enrolment, last login, disable, invite metadata
alter table public.admin_users
  add column totp_enrolled_at timestamptz,
  add column last_login_at   timestamptz,
  add column disabled_at     timestamptz,
  add column invited_by      text,
  add column created_by      text;

-- RLS: allow admin to update only their own row (used for last_login_at / totp_enrolled_at via service-role normally,
-- but kept here as defense-in-depth in case we ever expose direct updates)
create policy "admin_users_self_update"
  on public.admin_users for update
  to authenticated
  using (auth.jwt() ->> 'email' = email)
  with check (auth.jwt() ->> 'email' = email);

-- Audit log of admin actions
create table public.admin_audit_log (
  id           bigserial primary key,
  admin_email  text not null,
  action       text not null,
  target_table text,
  target_id    text,
  ip           inet,
  user_agent   text,
  success      boolean not null default true,
  meta         jsonb,
  created_at   timestamptz not null default now()
);

create index admin_audit_log_email_time  on public.admin_audit_log (admin_email, created_at desc);
create index admin_audit_log_action_time on public.admin_audit_log (action, created_at desc);

alter table public.admin_audit_log enable row level security;

-- Active admins can read the log
create policy "admin_audit_log_admin_read"
  on public.admin_audit_log for select
  to authenticated
  using (
    auth.jwt() ->> 'email' in (
      select email from public.admin_users where disabled_at is null
    )
  );

-- No INSERT policy: writes are service-role only (bypasses RLS).
