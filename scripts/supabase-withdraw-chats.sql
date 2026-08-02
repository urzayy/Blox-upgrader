-- Run once in Supabase: SQL Editor → New query → paste → Run
-- Persists live support / withdraw chat tickets across Render deploys and instances.

create table if not exists public.blox_withdraw_chats (
  id text primary key,
  user_id text not null,
  bundle jsonb not null,
  updated_at bigint not null
);

create index if not exists blox_withdraw_chats_user_id_idx on public.blox_withdraw_chats (user_id);
create index if not exists blox_withdraw_chats_updated_at_idx on public.blox_withdraw_chats (updated_at desc);
create index if not exists blox_withdraw_chats_open_status_idx on public.blox_withdraw_chats ((bundle->'ticket'->>'status'));

alter table public.blox_withdraw_chats enable row level security;

drop policy if exists "blox_withdraw_chats_no_public" on public.blox_withdraw_chats;
create policy "blox_withdraw_chats_no_public" on public.blox_withdraw_chats for all using (false);
