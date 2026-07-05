-- Run once in Supabase: SQL Editor → New query → paste → Run

create table if not exists public.blox_accounts (
  id text primary key,
  email text unique not null,
  password_hash text,
  salt text,
  nickname text,
  created_at bigint not null,
  last_seen_at bigint not null,
  last_login_at bigint,
  accepted_age boolean default true,
  accepted_terms boolean default true,
  event_count integer not null default 0,
  is_new_account boolean default false,
  synced_from_client boolean default false
);

create table if not exists public.blox_user_events (
  id text primary key,
  user_id text not null,
  email text not null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  line text,
  created_at bigint not null
);

create index if not exists blox_user_events_user_id_idx on public.blox_user_events (user_id);
create index if not exists blox_user_events_created_at_idx on public.blox_user_events (created_at desc);
create index if not exists blox_accounts_email_idx on public.blox_accounts (email);
create index if not exists blox_accounts_last_seen_idx on public.blox_accounts (last_seen_at desc);

alter table public.blox_accounts enable row level security;
alter table public.blox_user_events enable row level security;

-- Server uses secret key (bypasses RLS). Block public access:
drop policy if exists "blox_accounts_no_public" on public.blox_accounts;
drop policy if exists "blox_events_no_public" on public.blox_user_events;
create policy "blox_accounts_no_public" on public.blox_accounts for all using (false);
create policy "blox_events_no_public" on public.blox_user_events for all using (false);

create table if not exists public.blox_player_state (
  user_id text not null,
  email text primary key,
  balance bigint not null default 0,
  inventory jsonb not null default '[]'::jsonb,
  updated_at bigint not null
);

create index if not exists blox_player_state_user_id_idx on public.blox_player_state (user_id);
create index if not exists blox_player_state_updated_at_idx on public.blox_player_state (updated_at desc);

alter table public.blox_player_state enable row level security;

drop policy if exists "blox_player_state_no_public" on public.blox_player_state;
create policy "blox_player_state_no_public" on public.blox_player_state for all using (false);
