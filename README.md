# Fidger — private personal finance dashboard

Phase 1 scaffold: auth, MongoDB connection, Nextcloud WebDAV connection, health checks,
purple/black theme shell, navigation. Feature pages (debts, cards, transactions, etc.)
are built in subsequent phases and layered into this same repo.

## Stack
- Next.js 16 (App Router), plain JS
- MongoDB Atlas (free M0), bound as `DB` via `lib/db.js`
- Nextcloud WebDAV for file storage (`lib/nextcloud.js`)
- Vercel Hobby hosting + Vercel Cron (daily, 8 PM IST)
- Tailwind CSS v4, lucide-react icons

## 1. MongoDB Atlas setup
1. Create a free account at mongodb.com/cloud/atlas, create an M0 (free tier) cluster.
2. Database Access → add a user with a strong password (not your Atlas login password).
3. Network Access → add `0.0.0.0/0` (Vercel's serverless IPs are not static, so this is
   required — access is still gated by the DB username/password).
4. Get your connection string from "Connect" → "Drivers", it looks like:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/`

## 2. Nextcloud (tab.digital) setup
1. Log into your Nextcloud web UI.
2. Settings → Security → "Devices & sessions" → create a new **app password**, name it `fidger`.
3. Copy the generated password immediately (shown once).
4. Note your Nextcloud base URL (e.g. `https://yourname.tab.digital` — no trailing slash).

## 3. Generate your owner password hash
Locally (needs Node installed) or in any JS runtime:
```bash
npm install
node scripts/hashPassword.js "yourChosenPassword"
```
Copy the output (starts with `$2a$` or `$2b$`) — this goes into `OWNER_PASSWORD_HASH`.
Your plain password is never stored anywhere; only the hash is.

## 4. Generate AUTH_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. Environment variables
Copy `.env.example` to `.env.local` for local dev. On Vercel, set these under
Project → Settings → Environment Variables (Production + Preview):

| Variable | Source |
|---|---|
| `MONGODB_URI` | Atlas connection string (step 1) |
| `MONGODB_DB_NAME` | `fidger` |
| `OWNER_PASSWORD_HASH` | Output of step 3 |
| `AUTH_SECRET` | Output of step 4 |
| `NEXTCLOUD_URL` | Your Nextcloud base URL (step 2) |
| `NEXTCLOUD_USER` | Your Nextcloud username |
| `NEXTCLOUD_APP_PASSWORD` | App password from step 2 |

`CRON_SECRET` is set automatically by Vercel — do not set it manually.

## 6. Deploy
1. Push this repo to GitHub (you manage Codeberg → GitHub mirroring; Vercel connects to GitHub).
2. Import the repo in Vercel → New Project.
3. Add the environment variables above.
4. Deploy. `vercel.json` registers the daily cron automatically on deploy.

## 7. Verify (do this on the live Vercel URL, not local)
1. Visit the site — you should be redirected to `/login`.
2. Log in with your chosen password.
3. On `/dashboard`, confirm both "MongoDB (DB)" and "Nextcloud (WebDAV)" show **Connected**.
   - If DB fails: check `MONGODB_URI` and that Network Access allows `0.0.0.0/0`.
   - If Nextcloud fails: check `NEXTCLOUD_URL` has no trailing slash, and that the app
     password wasn't truncated when copied.
4. Log out, confirm you're redirected to `/login` and `/dashboard` is unreachable without
   logging in again (try visiting `/dashboard` directly while logged out).

## Timezone note on the cron
`vercel.json` schedules `30 14 * * *` UTC = 8:00 PM IST. Vercel Hobby cron fires
sometime within that scheduled hour, not at the exact minute. Change the UTC hour in
`vercel.json` if 8 PM should be in a different timezone.

## What's next
Debts, credit cards, cash/bank accounts, transactions, analytics, recurring detection,
subscriptions, budgets, goals, documents, notes, logs, export, and settings pages are
being built page-by-page in this same repo across the next messages in our conversation.
