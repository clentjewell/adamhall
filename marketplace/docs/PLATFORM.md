# Platform Documentation — Adam Hall, Buy My Car

**Status:** living document. Reflects the codebase as of 2026-07-20.
**Audience:** Jewell Projects team, Adam Hall, and any developer picking
this repo up cold.

---

## 1. Repository assessment & current-state summary

This is a **production Next.js 15 application**, not a mockup. It is a
single-dealer used-car marketplace with a real Supabase backend (Postgres +
RLS + Auth + Storage), real server actions, real email sending, and a real
deploy target. There is no separate backend service — Next.js Server
Actions and Route Handlers *are* the backend.

**Stack**

- **Next.js 15** (App Router, TypeScript, React 19), Tailwind CSS v4,
  mobile-first
- **Supabase** — Postgres with Row Level Security, Auth (email-allowlist
  admin, no public signup), Storage (two buckets: public car photos,
  private submission photos)
- **Resend** for transactional email; SMS is stubbed behind
  `lib/notify.ts` pending a Twilio integration
- **Zod** for all server-side input validation
- **Motion** (Framer Motion successor) for the small set of deliberate
  animations (hero stagger, card reveal, step transitions)
- No ORM — Supabase's JS client is the only data-access layer

**Deploy**

- Cloudflare Workers via `@opennextjs/cloudflare` (`wrangler.jsonc`,
  `open-next.config.ts`). `npm run cf:preview` / `npm run cf:deploy`.
- Git-connected Workers service `adamhall-marketplace`, root directory
  `marketplace`, build command `npx opennextjs-cloudflare build`, deploy
  command `npx opennextjs-cloudflare deploy`.
- Supabase project: `adamhall-marketplace` (`ocyxhfyphqyirjbyvhnw`),
  `ap-southeast-2`, Jewell Org.

**What exists today** (all three surfaces are live code, not stubs):

| Surface | Routes |
| --- | --- |
| Public marketplace | `/`, `/cars`, `/cars/[slug]`, `/finance`, `/saved`, `/compare`, `/about`, `/contact`, `/faq`, `/legal/*` |
| Sell / trade pipeline | `/sell`, `/sell/status/[token]` |
| Admin | `/admin/login`, `/admin` (dashboard), `/admin/submissions`, `/admin/submissions/[id]`, `/admin/inventory`, `/admin/inventory/new`, `/admin/inventory/[id]`, `/admin/enquiries`, `/admin/finance`, `/admin/analytics` |

**Demo content caveat (important):** `supabase/seed.sql` ships 8 demonstration
cars (one sold) and 3 submissions mid-pipeline so the app has something to
show. **None of this is real inventory.** The Google review quotes in
`lib/config.ts` are placeholder testimonials, not sourced from a real
Google Business Profile. Car photography in the seed data is a mix of stock
and AI-generated placeholder images — **no photo currently on the site is
a real photo of a real car on Adam's lot.** All of this must be swapped
before go-live (see §4).

---

## 2. Product assumptions

These are load-bearing and should be confirmed with Adam, not just
inherited from the build:

1. **Single dealer, single location.** No multi-tenant data model, no
   location switcher, no per-location inventory or pricing. Northern NSW
   only (Tweed Heads / Kingscliff / Banora Point area, per seed copy).
2. **Adam is the only consultant.** Every "who did this" field in the
   schema (`updated_by`, `actor`, checklist `_by` columns) records a name/
   email string, not a role or a foreign key to a staff table. There is no
   concept of assigning a submission or enquiry to a specific person
   because there is only one person.
3. **Guest-first, no customer accounts.** Buyers enquire, book test drives,
   use finance calculators, and save/compare cars entirely without signing
   up. Sellers submit a car and track it via a tokenised link, never a
   login. This is deliberate, not a missing feature — see §7.
4. **Trust is manual, not automated.** PPSR checks, valuations, and
   settlement steps are ticked by Adam himself; nothing here inspects a
   VIN or calls a PPSR API. The "trust" the site sells is Adam's judgement,
   captured in software, not a machine verifying anything.

---

## 3. Business decisions required before go-live

None of these are engineering blockers — the code path exists and works —
but every row below currently holds a placeholder, a guess, or an empty
value that only Adam (or Jewell Projects on his behalf) can supply.

| Decision | Where it lands in code | Current placeholder |
| --- | --- | --- |
| Trading phone number | `components/Header.tsx` (`PHONE_HREF`), footer, contact page | `tel:+61400000000` |
| Trading address / hours | `/contact`, `/about`, footer, `Vehicle`/LocalBusiness JSON-LD (if added) | Not yet set |
| Dealer licence number (NSW MVDA / Fair Trading) | Footer, `/legal/*`, `/about` | Not present — likely a legal requirement to display |
| Finance model: in-house vs broker vs referral, and which lender(s) | `/finance`, `app/actions/finance.ts`, `/legal/finance-disclaimer` | Calculator is generic amortisation; no named lender or panel; enquiries just land in `finance_enquiries` for Adam to action manually |
| Deposit & reservation terms | Not built (see §7 roadmap) | N/A — no online reservation exists yet, so no terms to encode |
| Real Google reviews source | `lib/config.ts` (`googleReviews`) | 3 fabricated quotes, fake rating/count, dummy Maps URL |
| CRM choice, if any | No CRM integration exists | See §9 for the integration pattern this schema is built to support |
| Real vehicle photography | `supabase/seed.sql`, Storage bucket `car-photos` | Stock/AI-generated placeholders |
| Legal review of `/legal/*` drafts | `app/legal/{privacy,terms,finance-disclaimer,website-disclaimer,complaints}/page.tsx` | Every page self-flags `DRAFT — requires review by the dealership's legal adviser` in an amber banner; do not publish as-is |
| Marketing consent wording | `app/actions/finance.ts` (`consent` checkbox), any future email opt-in | Generic "consent to pass details to our finance partner" — needs to match whatever the actual finance arrangement turns out to be |

---

## 4. User-role matrix

| Brief role | Who does it today | Notes |
| --- | --- | --- |
| Visitor / buyer | Anonymous, RLS-scoped `anon` reads | Browses, enquires, books a look, uses finance calculator, saves/compares (localStorage only) |
| Seller | Anonymous, token-scoped | Submits a car via `/sell`, tracks status via `/sell/status/[token]` — never authenticates |
| Sales consultant | **Adam (Admin)** | Enquiries queue, test-drive bookings |
| Sales manager | **Adam (Admin)** | Same login, same permissions — there is no manager tier above consultant |
| Inventory manager | **Adam (Admin)** | `/admin/inventory`, `/admin/inventory/new`, convert-submission-to-listing |
| Finance manager | **Adam (Admin)** | `/admin/finance` queue |
| Valuer / settlement clerk | **Adam (Admin)** | Valuation worksheet, settlement checklist |

**Why they collapse:** the brief's five staff roles all map to one person
today because Adam is the business. The `admin_users` table and `is_admin()`
RLS helper (`supabase/migrations/0001_init.sql`) are already
role-agnostic — they gate on "is this person allowed into admin at all,"
not "what can this admin do." That's a deliberate simplification, not a
gap: building a permissions matrix for a team of one would be pure
overhead.

**RBAC extension path**, when Adam hires: add a `role text` column to
`admin_users` (e.g. `consultant | manager | inventory | finance | owner`),
extend `is_admin()` into role-aware helpers (`is_owner()`, `can_manage_inventory()`,
etc.), and gate each admin route/action on the relevant helper instead of
the current single `is_admin()` check. No schema migration touches the
public-facing tables — this is purely additive to `admin_users` and the
RLS policies that already reference `is_admin()`.

---

## 5. Sitemap

**Public**

```
/                           Home — hero, "why deal with Adam", latest cars, reviews
/cars                       Filterable inventory (URL-synced filters)
/cars/[slug]                Car detail — gallery, trust block, enquiry/test-drive forms
/finance                    Repayment calculator + finance enquiry form
/saved                      localStorage-backed saved cars
/compare                    localStorage-backed comparison (max 3 cars)
/about                      About Adam
/contact                    Contact page
/faq                        FAQ
/legal/privacy
/legal/terms
/legal/finance-disclaimer
/legal/website-disclaimer
/legal/complaints
/sell                       4-step sell/trade submission flow
/sell/status/[token]        Tokenised, no-login status tracker for a seller
/sitemap.xml                Generated (app/sitemap.ts) — home, /cars, /sell, every live car
/robots.txt                 Generated (app/robots.ts) — disallows /admin and /sell/status
```

**Admin** (all behind `requireAdmin()` — Supabase Auth + `admin_users` allowlist)

```
/admin/login
/admin                       Dashboard — counts
/admin/submissions           Sell/trade pipeline queue
/admin/submissions/[id]      Worksheet: valuation, offer/decline, settlement checklist, audit trail
/admin/inventory             Listings manager
/admin/inventory/new         New listing
/admin/inventory/[id]        Edit listing, status buttons
/admin/enquiries             Buyer enquiries + test-drive bookings inbox
/admin/finance               Finance enquiry queue
/admin/analytics             Accept rate, margin by make, time-to-offer — from real audit data
```

---

## 6. Customer journeys

### Buy journey

```
Browse (/cars, filtered)
   → Car detail (/cars/[slug]) — gallery, PPSR badge, service history,
     "Adam's take", walk-around video slot
   → Save / Compare (localStorage, no account) and/or
   → Enquire or Book a look (writes to `enquiries`, kind = enquiry | book_look) and/or
   → Finance calculator (/finance) — repayment estimate, optional finance
     enquiry (writes to `finance_enquiries`)
   → Adam actions the enquiry from /admin/enquiries or /admin/finance
   → Car eventually flips to `sold` — stays visible 30 days (social proof),
     then a nightly pg_cron job archives it (supabase/migrations/0003_sold_auto_archive.sql)
```

### Sell / trade-in journey

```
/sell — 4-step conversational form:
   1. Rego / vehicle basics
   2. Condition (accidents, tyres, interior, mechanical, notes)
   3. Photos — direct-to-Storage upload with on-device compression
   4. Contact details
   → submission created (status = 'new'), audit-logged automatically
     (migrations/0002_submission_audit_trigger.sql), tokenised status link
     issued, localStorage save-and-resume if abandoned mid-flow
   → seller tracks progress at /sell/status/[token] — resolved server-side
     with the service-role key; never queryable via the anon key
   → can also enter via a trade-in bridge from any car page (`/sell?trade=slug`)
```

### Staff (Adam) journey — sell/trade side

```
/admin/submissions — pipeline queue (New → Reviewing → Offer made →
   Accepted → Declined → Settled)
   → open a submission → valuation worksheet (offer / expected retail /
     expected recon; margin is a generated column, never hand-entered)
   → one-click templated offer email or kind-decline email
   → on acceptance → settlement checklist (PPSR, payout letter, ID,
     rego transfer, funds cleared) — each item stamped with who ticked it
     and when, never bulk-set
   → "Convert to listing" — promotes the submission straight into `cars`
     as a draft, carrying over vehicle details and photos
   → every transition is written to `status_events` (append-only audit trail)
```

---

## 7. MVP scope (done) vs. post-launch roadmap

**Done (v1 / MVP)**

- Public inventory with URL-synced filters, car detail, JSON-LD, sitemap
- Enquiry + test-drive booking forms
- Finance repayment calculator + finance enquiry queue
- Guest-first saved / compare / recently-viewed (localStorage)
- Full sell/trade pipeline: submission → valuation → offer/decline →
  settlement checklist → convert-to-listing
- Admin dashboard, analytics (accept rate, margin by make, time-to-offer)
- Content pages (about, contact, FAQ, legal drafts)
- Audit trail (`status_events`) for submissions
- Auto-archive of sold listings after 30 days

**Explicitly out of scope for v1** (deliberate, not oversight):

- Customer accounts (buyer or seller)
- Online reservations / deposits
- Multi-consultant roles / staff assignment
- CRM or DMS integrations
- Multi-location support
- Live chat
- Auctions

**Post-launch roadmap**, roughly in the order Jewell Projects would
recommend tackling them:

1. **Buyer accounts** — saved/compare/recently-viewed already live in
   `lib/garage.ts` behind a clean interface (`getSaved`, `toggleSaved`,
   `getCompare`, `toggleCompare`, `getRecent`, `recordRecentView`,
   `onGarageChange`); migrating this to a server-backed account is a
   matter of swapping the storage layer, not redesigning the UI.
2. **Online reservations + deposits via Stripe.** Needs a `reservations`
   table (car, buyer, amount, Stripe payment intent id, status), a hold
   state on `cars.status` (e.g. `reserved`), and webhook handling for
   payment confirmation/cancellation. `watchlist_alerts` and `enquiries`
   already show the pattern for a lightweight, RLS-scoped public-insert
   table this would follow.
3. **Price-drop alerts** using the existing but currently-unused
   `watchlist_alerts` table (email, make, model, max_price, active,
   last_notified_at) — the schema anticipates this; nothing yet writes
   notifications off the back of a price change. Needs: a trigger or
   scheduled job comparing `cars.price` changes against active alerts,
   and a notifier call through the existing `lib/notify.ts` interface.
4. **CRM sync**, via the same "notifier-style interface" pattern already
   used for email/SMS (`lib/notify.ts`'s `Notifier` interface) — see §9.
5. **DMS / inventory feed import**, idempotent upsert keyed on VIN + source
   listing id — see §9.
6. **Live chat.**
7. **Multi-consultant support** once Adam hires — see the RBAC extension
   path in §4.

---

## 8. Integration architecture

Nothing below is built. This section documents the pattern the existing
schema and code already anticipate, so a future integration doesn't have
to invent conventions from scratch.

### CRM sync (outbox pattern)

`status_events` already functions as an append-only event log for
submissions (every status transition, `actor`, timestamp, optional note).
That's most of an outbox already. To add CRM sync:

- Add a `crm_sync_log` table: `id`, `entity_type`, `entity_id`,
  `external_id` (the CRM's record id), `status` (`pending | synced | failed`),
  `attempts`, `last_error`, `created_at`, `synced_at`.
- A worker (Supabase Edge Function on a schedule, or a Next.js route
  handler triggered by webhook/cron) reads unsynced `status_events` rows,
  pushes them to the CRM, and records the result in `crm_sync_log`.
- Idempotency: key the CRM push on `(entity_type, entity_id, to_status)` so
  a retried sync doesn't create duplicate CRM activity.
- Retries: `attempts` + exponential backoff in the worker; a `failed` row
  after N attempts surfaces in `/admin/analytics` or a dedicated ops view.

### DMS / inventory feed import

- Add a `source-of-truth field ownership` convention: a `source` column on
  `cars` (`manual | feed:<provider>`) so the admin UI knows which fields it
  can safely overwrite vs. which came from a feed and should round-trip
  back to the source system.
- Add an `inventory_sync_log` table mirroring `crm_sync_log`'s shape
  (`external_id`, `status`, `attempts`, `last_error`).
- **Duplicate prevention: upsert keyed on VIN.** `cars` doesn't currently
  store a VIN — add `vin text unique` (nullable, since manually-entered
  cars may not have one yet) and upsert on `(vin)` where present, falling
  back to `(source, external_id)` for feeds that don't expose a VIN
  directly.
- Because `cars` already has a `source_submission_id` pattern (linking a
  listing back to the trade-in it came from), the same shape extends
  naturally to "linking a listing back to the feed row it came from."

---

## 9. Analytics plan

**Honest status: not yet wired.** `/admin/analytics` computes business
metrics (accept rate, margin by make, time-to-offer) from real Supabase
data, but there is no visitor-facing analytics or event tracking on the
public site yet.

**Recommended plan:**

- **Cloudflare Web Analytics** (since the app already deploys to
  Cloudflare Workers) for privacy-respecting, cookie-free pageview and
  Core Web Vitals tracking — zero client JS cost beyond the beacon.
- **Custom event instrumentation**, once a destination (Cloudflare
  Analytics Engine, or a lightweight events table) is chosen. Proposed
  event names, matching existing terminology in the codebase:
  - `car_view` (slug, make, model, price)
  - `enquiry_submitted` (kind: enquiry | book_look, car slug)
  - `finance_calculated` (term, frequency, has_balloon)
  - `finance_enquiry_submitted`
  - `sell_flow_started`, `sell_flow_step_completed` (step index),
    `sell_flow_submitted`
  - `save_toggled`, `compare_toggled` (already client-side in
    `lib/garage.ts` — these events would fire from the same call sites)
  - `admin_offer_sent`, `admin_offer_declined`, `admin_settlement_completed`
- Until this is wired, `getResponseStat()` in `lib/stats.ts` is the only
  "analytics-like" signal in production — it derives a real median
  response time from `status_events`, cached hourly.

---

## 10. SEO summary

**What exists:**

- Per-car `generateMetadata` (title, description, OG tags) on
  `/cars/[slug]`
- `Vehicle` JSON-LD structured data embedded in the car detail page
- `app/sitemap.ts` — dynamically includes home, `/cars`, `/sell`, and
  every live car, with `lastModified` from `updated_at` and priority
  weighted by status (published > sold/other)
- `app/robots.ts` — allows everything except `/admin` and `/sell/status`
  (correctly keeps tokenised, PII-bearing status pages out of the index)
- Clean, human-readable slugs (`slugify()` in `lib/format.ts`)
- Sold-car handling is SEO-aware: visible (and indexable, lower priority)
  for 30 days as social proof, then auto-archived by pg_cron so stale
  "sold" pages don't linger in search results indefinitely

**What's next:**

- Make/model landing pages (e.g. `/cars/toyota`, `/cars/toyota/corolla`)
  to capture long-tail search intent beyond the filtered `/cars` view
- Breadcrumbs sitewide — `components/Breadcrumbs.tsx` exists but isn't yet
  paired with `BreadcrumbList` JSON-LD on every page that uses it
- `LocalBusiness` JSON-LD once the real address/phone/hours are confirmed
  (§3) — currently no local-business structured data at all
- Image `alt` audit once real photography replaces the seed placeholders

---

## 11. Security & privacy model

**RLS summary** (full policies in `supabase/migrations/0001_init.sql` and
`0002_submission_audit_trigger.sql`):

| Table | Anon (public) | Admin |
| --- | --- | --- |
| `cars` | `select` where `published`, or `sold` within 30 days | full |
| `submissions` | `insert` only (`status = 'new'`); no `select` — see below | full |
| `submission_photos` | `insert` only | full |
| `valuations` | none | full |
| `enquiries` | `insert` only (`status = 'new'`) | full |
| `finance_enquiries` | `insert` only (`status = 'new'`) | full |
| `settlement_checklists` | none | full |
| `status_events` | none (`select`/`insert` both admin-only) | full |
| `watchlist_alerts` | `insert` only (`active = true`) | full |
| `admin_users` | a user reads only their own row | full |

All admin access flows through a single `is_admin()` `security definer`
SQL function keyed on `auth.uid()` against `admin_users` — one gate, used
consistently instead of ad hoc checks scattered across policies.

**Submission photos are never public.** They live in the private
`submission-photos` Storage bucket; sellers can `insert` (upload) but not
`select` (read back) via the anon key, and admins view them only through
signed URLs generated server-side. Listing photos, by contrast, live in
the public `car-photos` bucket since they're meant to be indexed and
embedded everywhere.

**Sellers never read their own submission via the API.** The tokenised
`/sell/status/[token]` page resolves the token **server-side using the
service-role key** (`SUPABASE_SERVICE_ROLE_KEY`, never exposed to the
browser) — this is the one deliberate bypass of RLS, and it's scoped to a
single lookup by an unguessable random token, not a general-purpose
service-role client shipped anywhere near user input.

**Service-role usage is narrow and enumerable:** `lib/supabase/service.ts`
(seller status resolution, `lib/stats.ts` response-time stat, admin photo
signed URLs). It is never imported into anything that runs client-side.

**Secrets handling:** `.env.example` documents every required var;
`SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are server-only secrets
set in Cloudflare's runtime secrets (not build variables), per the README's
deploy instructions.

**Privacy:**

- **Data minimisation** is mostly already the default: forms only ask for
  what the relevant flow needs (e.g. `enquiries` doesn't collect an email
  at all, only phone — matching Adam's "I'll just call you" model).
- **Retention** is not yet formally defined. `submissions`, `enquiries`,
  and `finance_enquiries` currently accumulate indefinitely with no
  deletion or anonymisation job. This should be paired with whatever the
  legal-reviewed privacy policy (§3) commits to — the code has no opinion
  yet and needs one before publishing `/legal/privacy` for real.

---

## 12. Manual QA checklist

**Public — browse & buy**

- [ ] `/cars` filters (make, model, price range, km max, body, transmission,
      fuel) narrow results correctly and combine without conflicting
- [ ] Sort by price ascending/descending works
- [ ] Filters persist in the URL (shareable/bookmarkable link reproduces
      the same result set)
- [ ] Car detail page renders gallery, PPSR badge, service history, and
      "Adam's take" for every seed car
- [ ] Sold cars remain visible with a SOLD badge; check one that's >30 days
      old is *not* visible (or manually test the archive function)
- [ ] Enquiry form submits successfully and appears in `/admin/enquiries`
- [ ] Book-a-look form submits with a time window and appears correctly
      tagged as `book_look`
- [ ] Trade-in bridge link (`/sell?trade=slug`) pre-fills the target car

**Finance**

- [ ] Calculator updates live as term/rate/deposit/balloon change
- [ ] Weekly, fortnightly, and monthly frequencies all produce sane numbers
- [ ] Zero-deposit and full-deposit (amount financed = 0) edge cases don't
      break the UI
- [ ] Finance enquiry submits and lands in `/admin/finance` with correct
      consent flag
- [ ] Finance disclaimer link is visible near the calculator

**Saved / compare (guest, localStorage)**

- [ ] Saving a car from a card and from the detail page both update
      `/saved` and the nav badge
- [ ] Adding a 4th car to compare is rejected with the inline error, not a
      silent drop
- [ ] Compare page renders a clean side-by-side for 2–3 cars
- [ ] Recently-viewed updates on every car detail visit, capped at 12,
      de-duped
- [ ] State survives a page reload (localStorage) but is scoped to one
      browser (no sync across devices — confirm this is expected)

**Sell / trade pipeline**

- [ ] All 4 steps of `/sell` validate before allowing "Next"
- [ ] Photo upload compresses client-side and completes on a slow
      connection (throttle test)
- [ ] Abandoning mid-flow and returning restores progress (localStorage
      save-and-resume)
- [ ] Submission appears in `/admin/submissions` with status `new` and a
      matching `status_events` row
- [ ] `/sell/status/[token]` shows correct status and is *not* accessible
      without the token
- [ ] `/sell/status/[token]` is excluded from `/robots.txt` and `/sitemap.xml`

**Admin**

- [ ] Login rejects a non-allowlisted Supabase user (`?denied=1` redirect)
- [ ] Valuation worksheet margin auto-computes and is read-only (generated
      column, never hand-typed)
- [ ] Sending an offer email and a decline email both log to
      `status_events` and actually send (check Resend logs or console in
      dev)
- [ ] Settlement checklist requires each item ticked individually; each
      tick records who + when
- [ ] "Convert to listing" carries over vehicle details/photos into a
      draft car
- [ ] `/admin/analytics` numbers change sensibly after actioning a test
      submission end-to-end
- [ ] Admin photo viewing uses signed URLs (submission photos never
      resolve via a public/unsigned bucket URL)

**Mobile**

- [ ] Sticky mobile action bar (`components/MobileActionBar.tsx`) doesn't
      overlap content or the sell-flow step indicator
- [ ] Sell flow's 4 steps are usable one-handed on a small viewport
- [ ] Gallery swiping and finance calculator inputs work on touch

**Accessibility**

- [ ] All forms have associated labels and visible focus states
- [ ] Colour contrast holds for the amber "SOLD" / status highlights
      against bone/paper backgrounds
- [ ] Images have meaningful `alt` text (flag any seed placeholders with
      generic alt text for follow-up)
- [ ] Keyboard-only navigation can complete an enquiry and the full sell
      flow

---

## 13. Deployment & setup

**Environment variables** (`.env.example`):

| Var | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | build | public, safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | build | public, safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | **runtime secret** | never exposed to the browser — seller status reads, response-time stat, admin signed URLs |
| `NEXT_PUBLIC_SITE_URL` | build | used in emails + sitemap |
| `RESEND_API_KEY` | runtime secret | empty in dev → emails log to console instead of sending |
| `EMAIL_FROM` | runtime secret | sending identity |
| `ADMIN_NOTIFY_EMAIL` | runtime secret | Adam's inbox for new-lead notifications |

**Cloudflare Workers build settings** (Git-connected `adamhall-marketplace`
service):

- Root directory: `marketplace`
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`
- Build variables: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
- Runtime secrets (Settings → Variables and Secrets):
  `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
  `ADMIN_NOTIFY_EMAIL`

**Local setup:**

```bash
cd marketplace
npm install
cp .env.example .env.local   # fill values per the table above
npm run dev
```

**Database migrations** live in `supabase/migrations/`, applied in order:

- `0001_init.sql` — core schema, RLS, storage buckets
- `0002_submission_audit_trigger.sql` — auto-logs the `new` status event
- `0003_sold_auto_archive.sql` — nightly pg_cron archive of 30-day-old solds
- `0004_finance_enquiries.sql` — `finance_enquiries` table + RLS

`supabase/seed.sql` loads demo data — **demonstration content only**, see
the caveat in §1. Do not treat seeded cars, reviews, or submissions as real.

**Creating an admin user** (no public signup path by design):

```sql
-- 1. Create the auth user first: Supabase Dashboard → Auth → Add user
-- 2. Then allowlist them:
insert into admin_users (id, email, name)
values ('<auth-user-uuid>', 'adam@example.com', 'Adam');
```

A demo admin (`adam@buymycar.demo`) exists on the seeded project for
walkthroughs — rotate or remove its credentials before go-live.

---

## Appendix: things still marked as placeholder in code

Grep-able markers for anyone doing a pre-launch sweep:

- `lib/config.ts` → `googleReviews` (fabricated quotes, rating, count, URL)
- `components/Header.tsx` → `PHONE_HREF` (`tel:+61400000000`)
- `app/legal/*/page.tsx` → every page renders a `DRAFT — requires review by
  the dealership's legal adviser` banner
- `supabase/seed.sql` → all 8 demo cars, 3 demo submissions
- README's own "before go-live" note: *"also put real values in
  `lib/config.ts` (Google reviews) and `components/Header.tsx` (phone
  number)"*
