# Adam Hall Proposal — Cloudflare Deck

The live web version of the Adam Hall Operating System proposal. Single self-contained
page (`public/index.html`), deployed as a **Cloudflare Worker with static assets** — the
current "Workers & Pages" model. Content is sourced from
`../00 Admin/08 Proposal + Pricing/ProposalCopy__AdamHall__CloudflarePreso__Draft__v01.md`.

## Structure

```
site/
  public/index.html   # the whole deck — HTML, CSS and JS inline, no external requests
  wrangler.jsonc      # Cloudflare config (assets-only Worker, name: adamhall-proposal)
  package.json        # dev + deploy scripts
```

## Local preview

```bash
cd site
npm install
npm run dev          # wrangler dev — serves the deck locally
```

## Deploy

Needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the environment (or `wrangler login`).

```bash
cd site
npm run deploy       # wrangler deploy → https://adamhall-proposal.<subdomain>.workers.dev
```

To put it on a custom domain (e.g. `proposal.adamhallbuymycar.com.au`), add a route/custom
domain in the Cloudflare dashboard under the `adamhall-proposal` Worker, or a `routes` entry
in `wrangler.jsonc`.

## Editing

The deck is intentionally one file with no build step and no external dependencies (fast,
offline-safe, nothing to break in front of a client). Edit `public/index.html` and re-run
`npm run deploy`. Keep the copy in sync with the source doc in `00 Admin/08 Proposal + Pricing`.

## Guardrails

- Only confirmed figures appear on-slide (~$5M, ~25 cars/month, 90/10, ~$4,200 gross).
- Stage 2 / Stage 3 dollar amounts are quoted at the gates — never shown here.
- `noindex` is set — this is a private client proposal, not for search engines.
