# Adam Hall — Buy My Car marketplace

Production web app for Adam Hall's used-car business: one dealer's curated
inventory plus a sell-to-us pipeline that captures Adam's valuation judgement
in software. Working name **Adam Hall** until branding is decided.

## Stack

- **Next.js 15** (App Router, TypeScript), Tailwind CSS v4, mobile-first
- **Supabase** — Postgres + RLS, Auth (admin allowlist), Storage (car photos)
- **Resend** for email; SMS stubbed behind `lib/notify.ts` for Twilio later

Live Supabase project: `adamhall-marketplace` (`ocyxhfyphqyirjbyvhnw`,
ap-southeast-2, Jewell Org).

## Three surfaces

| Surface | Routes | What it does |
| --- | --- | --- |
| Public marketplace | `/`, `/cars`, `/cars/[slug]` | Filterable inventory (URL-synced filters), car detail with gallery, trust block (PPSR badge, inspection, service history, "Adam's take"), walk-around video slot, enquire / book-a-look forms, SOLD cars visible 30 days then auto-archived, per-car OG tags + `Vehicle` JSON-LD + sitemap |
| Sell your car | `/sell`, `/sell/status/[token]` | 4-step conversational form (rego → condition → photos → contact), direct-to-Storage uploads with on-device compression, localStorage save-and-resume, tokenised status page (no account), live "typical response" stat from real audit events, trade-in bridge from any car page (`/sell?trade=slug`) |
| Admin | `/admin/*` | Supabase Auth with email allowlist (no signup), dashboard counts, submissions queue with `New → Reviewing → Offer made → Accepted → Declined → Settled` pipeline, valuation worksheet (offer / expected retail / recon, auto margin, private notes), one-click templated offer + kind decline emails, inventory manager with convert-to-listing, enquiries inbox, settlement checklist (PPSR, payout letter, ID, rego transfer, funds — each tick stamped with who + when), full audit trail |

## Local setup

```bash
cd marketplace
npm install
cp .env.example .env.local   # fill values below
npm run dev
```

| Env var | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | already in `.env.example` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` | same page — server-only; needed for the seller status page, response-time stat, and admin photo signed URLs |
| `RESEND_API_KEY` | resend.com — leave empty in dev, emails log to console |
| `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL` | your sending identity + Adam's inbox |
| `NEXT_PUBLIC_SITE_URL` | the deployed URL (used in emails + sitemap) |

## Database

Schema lives in `supabase/migrations/` (already applied to the live project):

- `0001_init.sql` — tables (`cars`, `submissions`, `submission_photos`,
  `valuations`, `enquiries`, `settlement_checklists`, `status_events`,
  `admin_users`, `watchlist_alerts`), RLS policies, storage buckets
- `0002_submission_audit_trigger.sql` — auto-log `new` events on submission
- `0003_sold_auto_archive.sql` — pg_cron nightly archive of 30-day-old solds

`supabase/seed.sql` holds the demo data: 8 realistic cars (one sold) and
3 submissions mid-pipeline with a filled valuation worksheet.

**RLS in one paragraph:** anon can read published cars (plus sold ones for
30 days), insert submissions/photos/enquiries/watchlist rows, and nothing
else. Sellers never read their submission via the API — the status page
resolves the token server-side with the service role. Admins (rows in
`admin_users`) get full access via the `is_admin()` helper. Submission
photos live in a private bucket, served to admins through signed URLs;
listing photos are public.

## Admin access

No public signup. Add an admin by creating the auth user (Dashboard → Auth →
Add user) and inserting their allowlist row:

```sql
insert into admin_users (id, email, name)
values ('<auth-user-uuid>', 'adam@example.com', 'Adam');
```

A demo admin exists for the seeded project: `adam@buymycar.demo`
(credentials shared out-of-band; rotate before go-live).

## Design system

Trust-first and warm, not flashy: forest green on bone (`--color-forest-*`,
`--color-paper`), amber strictly for status highlights (SOLD, response
stat). Type: Bricolage Grotesque display over Figtree body. Shape rule —
buttons pill, cards 16px radius, inputs 8px. Tokens in `app/globals.css`.

## Deploying — Cloudflare Workers

The app ships with `@opennextjs/cloudflare` configured (`wrangler.jsonc`,
`open-next.config.ts`). Locally: `npm run cf:preview` to test,
`npm run cf:deploy` to deploy with your own Cloudflare auth.

For the Git-connected `adamhall-marketplace` Workers service, set in the
Cloudflare dashboard (Settings → Build):

- **Root directory:** `marketplace`
- **Build command:** `npx opennextjs-cloudflare build`
- **Deploy command:** `npx opennextjs-cloudflare deploy`
- **Build variables:** `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
- **Runtime secrets** (Settings → Variables and Secrets):
  `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
  `ADMIN_NOTIFY_EMAIL`

Before go-live, also put real values in `lib/config.ts` (Google reviews)
and `components/Header.tsx` (phone number).

## What v1 deliberately leaves out

No online payments, no buyer accounts, no auctions, no finance
applications, no multi-dealer support.
