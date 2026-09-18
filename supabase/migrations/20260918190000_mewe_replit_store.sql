-- Persist the Replit Me We client store on Supabase so production
-- (Vite + Vercel) does not need the Replit Express/Neon stack.
-- Passwords and session tokens are never written by the client persist layer.

create table if not exists public.mewe_replit_store (
  store_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.mewe_replit_store enable row level security;

drop policy if exists mewe_replit_store_own on public.mewe_replit_store;
create policy mewe_replit_store_own
  on public.mewe_replit_store
  for all
  to authenticated
  using (store_key = auth.uid()::text)
  with check (store_key = auth.uid()::text);

grant select, insert, update, delete on public.mewe_replit_store to authenticated;
grant all on public.mewe_replit_store to service_role;
