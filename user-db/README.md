# User database — Blox Upgrader

Server-side store for **every registered account** and **everything they do** on the site.

## Files

| Path | Contents |
|------|----------|
| `user-db/users.json` | Index of all users (email, id, createdAt, lastSeenAt, eventCount) |
| `user-db/events/{userId}.jsonl` | One JSON line per action (upgrade, deposit, click, login, etc.) |
| `user-logs/{email}.txt` | Plain-text mirror (Notepad-friendly export) |

## When data is written

1. **Register / login / session restore** → `POST /api/users/sync`
2. **Every tracked action** → `POST /api/user-log` (also appends to `.txt`)

## Admin panel

Log in as admin → header button **Users DB** → pick a user → see full activity → **Export .txt**.

## API (admin only)

- `GET /api/admin/user-db/users?adminEmail=...`
- `GET /api/admin/user-db/users/:userId?adminEmail=...`
- `GET /api/admin/user-db/users/:userId/export.txt?adminEmail=...`

Admin emails: `urzay1v1@gmail.com`, `ecruzcastillo2009@gmail.com`

## Production (Render)

Mount persistent disk to `user-db` so data survives redeploys. See `render.yaml`.

Local data is **not committed** to git (see `.gitignore`).
