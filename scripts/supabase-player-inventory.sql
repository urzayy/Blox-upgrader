-- Run in Supabase SQL Editor if SEE inventory fails to load.
-- Adds inventory columns to the accounts table you already have.

alter table public.blox_accounts add column if not exists balance bigint not null default 0;
alter table public.blox_accounts add column if not exists inventory jsonb not null default '[]'::jsonb;
alter table public.blox_accounts add column if not exists inventory_updated_at bigint;
