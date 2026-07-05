# User database — Blox Upgrader

Server-side store for **everyone who registers on bloxupgrader.com**.

## Production (bloxupgrader.com)

All registrations go to the **Render server disk**, not your PC:

| File | Contents |
|------|----------|
| `/var/data/user-db/accounts.json` | Registered emails + password hashes |
| `/var/data/user-db/users.json` | User index (activity stats) |
| `/var/data/user-db/events/*.jsonl` | Every action per user |
| `/var/data/user-logs/*.txt` | Plain-text activity logs |

**View users:** log in as admin on bloxupgrader.com → **Users DB** button.

**Requires:** Render **Starter plan** + **1 GB persistent disk** (see `render.yaml`).

## Local development

Same structure under `user-db/` in the project folder, but only when using:

```bash
npm run dev
```

Registrations on **bloxupgrader.com** do **not** appear in your local `user-db/` folder.

## Flow

1. User registers on bloxupgrader.com
2. Browser calls `POST /api/auth/register`
3. Server writes to `/var/data/user-db/` (persistent disk)

## Admin API

- `GET /api/admin/user-db/status?adminEmail=...`
- `GET /api/admin/user-db/users?adminEmail=...`

Admin emails: `urzay1v1@gmail.com`, `ecruzcastillo2009@gmail.com`
