# User database — Blox Upgrader

Production registrations are stored in **Supabase** (free tier).

## Setup (once)

1. Open Supabase → **SQL Editor** → New query
2. Paste all of `scripts/supabase-schema.sql`
3. Click **Run**

## Environment variables

| Variable | Where |
|----------|--------|
| `SUPABASE_URL` | `.env` locally + Render Environment |
| `SUPABASE_SECRET_KEY` | `.env` locally + Render Environment (secret) |

Never commit `.env` or paste secret keys in GitHub.

## View users

**bloxupgrader.com** → admin login → **Users DB**

Or Supabase → **Table Editor** → `blox_accounts` / `blox_user_events`

## Local dev

Uses the same Supabase project when `.env` is configured. The local `user-db/` folder is only a fallback without Supabase env vars.
