<p align="center">
  <img src="https://raw.githubusercontent.com/sproutaac/.github/main/brand/sprout-mark.png" width="88" alt="Sprout AAC logo">
</p>

# Sprout AAC — Website

Marketing and waitlist site for [Sprout AAC](https://sproutaac.org) — a free, offline-first AAC app for children who communicate differently.

![Sprout AAC website](https://sproutaac.org/og-image.png)

## Stack

- **Hosting:** Cloudflare Pages
- **Backend:** Cloudflare Pages Functions (JS)
- **Database:** Cloudflare D1 (SQLite)
- **Email:** Resend

## Project structure

```
public/
  index.html          # Full marketing site (single file, inline CSS + JS), incl. the tablet live demo
  privacy.html        # Privacy policy
  brand.html          # Brand guide (/brand): logo, usage, colors, type, voice
  brand-assets/       # Downloads linked from /brand (logo SVG/PNG, app icon, social image)
  sprout-mark.svg     # Official logo (vector): nav logo + SVG favicon
  sprout-mark.png     # Logo PNG (used in structured data)
  favicon.ico         # 16/32/48px, rendered from the vector logo
  favicon.png         # 48px favicon
  apple-touch-icon.png  # 180px home-screen icon (cream app icon)
  og-image.png        # Link-preview image (1200×630); source template in sproutaac/.github/brand/social/templates
  robots.txt, sitemap.xml, llms.txt

functions/
  api/
    signup.js         # POST /api/signup — adds email to waitlist, sends confirmation
    count.js          # GET  /api/count  — active subscriber count (5min cache)
    unsubscribe.js    # GET  /api/unsubscribe — HMAC-verified one-click unsubscribe
  admin/
    signups.js        # GET  /admin/signups — HTML table of all signups (key-gated)
    broadcast.js      # GET/POST /admin/broadcast — send email to all subscribers

migrations/
  0001_init.sql       # WaitlistSignup table
  0002_unsubscribe.sql
  0003_beta_tester.sql

wrangler.toml         # Pages config, D1 binding
```

## Local development

```bash
npx wrangler pages dev public --d1 DB=<local-db-id>
```

## Deploy

Pushing to `main` deploys automatically via GitHub Actions (`.github/workflows/deploy.yml`, which runs `wrangler pages deploy public`). For a hotfix you can also deploy directly:

```bash
npx wrangler pages deploy public --project-name sproutaac-web
```

## Database

D1 database: `sproutaac-db`

```sql
CREATE TABLE "WaitlistSignup" (
  "id"           TEXT     NOT NULL PRIMARY KEY,
  "email"        TEXT     NOT NULL UNIQUE,
  "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unsubscribed" INTEGER  NOT NULL DEFAULT 0,
  "betaTester"   INTEGER  NOT NULL DEFAULT 0
);
```

Useful commands:

```bash
# View all signups
npx wrangler d1 execute sproutaac-db --remote --command 'SELECT * FROM "WaitlistSignup" ORDER BY createdAt DESC'

# Apply a migration
npx wrangler d1 migrations apply sproutaac-db --remote

# Count active subscribers
npx wrangler d1 execute sproutaac-db --remote --command 'SELECT COUNT(*) FROM "WaitlistSignup" WHERE unsubscribed = 0'
```

## Environment secrets

Set via `npx wrangler secret put <NAME>`:

| Secret | Purpose |
|---|---|
| `ADMIN_KEY` | Gates `/admin/*` routes and signs unsubscribe tokens |
| `RESEND_API_KEY` | Sends confirmation + broadcast emails |
| `NOTIFICATION_EMAIL` | Admin notification target on new signup |

## Email flow

1. New signup → confirmation email to signee + admin notification to `NOTIFICATION_EMAIL`
2. Unsubscribe tokens are HMAC-SHA256(email, ADMIN_KEY), URL-safe base64 — no DB storage needed
3. Broadcast emails are sent to all `unsubscribed = 0` rows, each with a personalised unsubscribe link

## Contributing

See [CONTRIBUTING.md](https://github.com/sproutaac/.github/blob/main/CONTRIBUTING.md). Copy and content improvements are welcome — no Flutter knowledge required.

## App repo

[github.com/sproutaac/app](https://github.com/sproutaac/app)

## Brand assets

The official logo, colors, and social images live in [`sproutaac/.github/brand`](https://github.com/sproutaac/.github/tree/main/brand), with a public guide at [sproutaac.org/brand](https://sproutaac.org/brand). `sprout-mark.svg` is the master. The favicons, `apple-touch-icon.png`, `og-image.png`, and everything in `public/brand-assets/` are generated from the files there; regenerate them rather than editing them by hand.
