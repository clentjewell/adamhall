# Adam Hall Buy My Car — Brand Identity (Cloudflare)

A password-gated Cloudflare Worker that serves the Version&nbsp;One brand
identity as a laid-out web page. Mirrors the `summary-site` worker and the
Beyond the Clinic `/brand/` reference.

- **Worker name:** `adamhall-brand`
- **Page:** `public/index.html` — logo suite, colour, typography, imagery and
  applications, rebuilt from `Adam-Hall-Brand-Identity-V1.pdf` (cover page
  omitted).
- **Assets:** `public/assets/` — brand marks and application mockups.

## Deploy

```sh
cd "02 Design/brand-site"
npx wrangler secret put SITE_PASSWORD   # set the shared access password
npx wrangler deploy
```

The worker runs first on every request (`run_worker_first`) and gates all
assets behind the password. Without `SITE_PASSWORD` set, the site returns a
503 configuration notice.
