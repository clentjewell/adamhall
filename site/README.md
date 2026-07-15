# Adam Hall Proposal — Cloudflare Deck

The live web version of the Adam Hall Operating System proposal. Single self-contained
page (`site/public/index.html`), served by the **`adamhall` Cloudflare Worker** using
static assets — the current "Workers & Pages" model. Content is sourced from
`../00 Admin/08 Proposal + Pricing/ProposalCopy__AdamHall__CloudflarePreso__Draft__v01.md`.

## Structure

```
wrangler.jsonc        # (repo root) Cloudflare config — name: adamhall, assets: ./site/public
package.json          # (repo root) dev + deploy scripts
site/public/index.html  # the whole deck — HTML, CSS and JS inline, no external requests
site/README.md          # this file
```

The deploy config lives at the **repo root** (not in `site/`) so the Cloudflare Git
integration on the `adamhall` worker — which runs `npx wrangler deploy` from the root on
every push — picks it up automatically.

## Deploy

**Automatic:** pushing to any branch triggers the Cloudflare Git integration, which runs
`npx wrangler deploy` and updates the `adamhall` worker. Merging to `main` deploys production.

**Manual** (needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`, or `wrangler login`):

```bash
npm install
npm run dev       # local preview
npm run deploy    # wrangler deploy → https://adamhall.<subdomain>.workers.dev
```

Custom domain (e.g. `proposal.adamhallbuymycar.com.au`): add a route/custom domain to the
`adamhall` worker in the Cloudflare dashboard, or a `routes` entry in `wrangler.jsonc`.

## Editing

One file, no build step, no external dependencies (fast, offline-safe, nothing to break in
front of a client). Edit `site/public/index.html`, then push (auto-deploy) or `npm run deploy`.
Keep the copy in sync with the source doc in `00 Admin/08 Proposal + Pricing`.

## Guardrails

- Only confirmed figures appear on-slide (~$5M, ~25 cars/month, 90/10, ~$4,200 gross).
- Stage 2 / Stage 3 dollar amounts are quoted at the gates — never shown here.
- `noindex` is set — this is a private client proposal, not for search engines.
