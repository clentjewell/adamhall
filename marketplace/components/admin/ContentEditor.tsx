"use client";

import { useState, useTransition } from "react";
import { saveSiteContent } from "@/app/actions/content";
import type { SiteContent } from "@/lib/content";

// Adam's plain-words editor. Every field maps 1:1 to a string on the
// public site; save publishes within seconds.
export default function ContentEditor({ initial }: { initial: SiteContent }) {
  const [c, setC] = useState<SiteContent>(initial);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const save = () =>
    startTransition(async () => {
      setStatus(null);
      const r = await saveSiteContent(c);
      setStatus(
        r.ok
          ? { ok: true, msg: "Saved. The site updates within a few seconds." }
          : { ok: false, msg: r.error ?? "Couldn't save." },
      );
    });

  const text = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: { rows?: number; helper?: string } = {},
  ) => (
    <div>
      <label className="label">{label}</label>
      {opts.rows ? (
        <textarea
          rows={opts.rows}
          className="input resize-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {opts.helper && <p className="helper">{opts.helper}</p>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <section className="card p-5 space-y-4">
        <h2 className="font-bold">Phone number</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {text("Shown on the site", c.phone.display, (v) =>
            setC({ ...c, phone: { ...c.phone, display: v } }),
          )}
          {text("Dial link", c.phone.tel, (v) => setC({ ...c, phone: { ...c.phone, tel: v } }), {
            helper: "Format: tel:+61400000000 — used when someone taps Call.",
          })}
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold">Home page hero</h2>
        {text("Headline", c.hero.headline, (v) => setC({ ...c, hero: { ...c.hero, headline: v } }))}
        {text("Line under the headline", c.hero.subtext, (v) => setC({ ...c, hero: { ...c.hero, subtext: v } }), { rows: 2 })}
        <div className="grid sm:grid-cols-2 gap-4">
          {text("Main button", c.hero.ctaPrimary, (v) => setC({ ...c, hero: { ...c.hero, ctaPrimary: v } }))}
          {text("Second button", c.hero.ctaSecondary, (v) => setC({ ...c, hero: { ...c.hero, ctaSecondary: v } }))}
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold">Why people deal with Adam (3 points)</h2>
        {c.why.map((w, i) => (
          <div key={i} className="grid sm:grid-cols-[1fr_2fr] gap-4 border-t border-stone-100 pt-4 first:border-0 first:pt-0">
            {text(`Point ${i + 1} title`, w.title, (v) =>
              setC({ ...c, why: c.why.map((x, j) => (j === i ? { ...x, title: v } : x)) }),
            )}
            {text("Detail", w.body, (v) =>
              setC({ ...c, why: c.why.map((x, j) => (j === i ? { ...x, body: v } : x)) }),
            )}
          </div>
        ))}
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold">Green &ldquo;Selling?&rdquo; band</h2>
        {text("Heading", c.sellBand.heading, (v) => setC({ ...c, sellBand: { ...c.sellBand, heading: v } }))}
        {text("Body", c.sellBand.body, (v) => setC({ ...c, sellBand: { ...c.sellBand, body: v } }), { rows: 2 })}
        {text("Button", c.sellBand.cta, (v) => setC({ ...c, sellBand: { ...c.sellBand, cta: v } }))}
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold">Page intros</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {text("Cars page title", c.carsHero.title, (v) => setC({ ...c, carsHero: { ...c.carsHero, title: v } }))}
          {text("Sell page title", c.sellHero.title, (v) => setC({ ...c, sellHero: { ...c.sellHero, title: v } }))}
        </div>
        {text("Cars page intro", c.carsHero.sub, (v) => setC({ ...c, carsHero: { ...c.carsHero, sub: v } }), { rows: 2 })}
        {text("Sell page intro", c.sellHero.sub, (v) => setC({ ...c, sellHero: { ...c.sellHero, sub: v } }), { rows: 2 })}
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold">Footer</h2>
        {text("About blurb", c.footer.blurb, (v) => setC({ ...c, footer: { ...c.footer, blurb: v } }), { rows: 2 })}
        {text(
          "“The deal with us” points (one per line)",
          c.footer.deal.join("\n"),
          (v) => setC({ ...c, footer: { ...c.footer, deal: v.split("\n").filter((l) => l.trim()) } }),
          { rows: 4 },
        )}
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold">Reviews strip</h2>
        <div className="grid grid-cols-2 gap-4 max-w-xs">
          {text("Rating", String(c.reviews.rating), (v) =>
            setC({ ...c, reviews: { ...c.reviews, rating: Number(v) || 0 } }),
          )}
          {text("Review count", String(c.reviews.count), (v) =>
            setC({ ...c, reviews: { ...c.reviews, count: Number(v) || 0 } }),
          )}
        </div>
        {c.reviews.quotes.map((q, i) => (
          <div key={i} className="border-t border-stone-100 pt-4 space-y-3">
            {text(`Quote ${i + 1}`, q.text, (v) =>
              setC({
                ...c,
                reviews: {
                  ...c.reviews,
                  quotes: c.reviews.quotes.map((x, j) => (j === i ? { ...x, text: v } : x)),
                },
              }),
              { rows: 2 },
            )}
            <div className="grid grid-cols-2 gap-4">
              {text("Name", q.author, (v) =>
                setC({
                  ...c,
                  reviews: {
                    ...c.reviews,
                    quotes: c.reviews.quotes.map((x, j) => (j === i ? { ...x, author: v } : x)),
                  },
                }),
              )}
              {text("Suburb", q.suburb, (v) =>
                setC({
                  ...c,
                  reviews: {
                    ...c.reviews,
                    quotes: c.reviews.quotes.map((x, j) => (j === i ? { ...x, suburb: v } : x)),
                  },
                }),
              )}
            </div>
          </div>
        ))}
        <p className="helper">
          Only use genuine reviews. These show publicly with the Google rating.
        </p>
      </section>

      <div className="sticky bottom-4 card p-4 flex items-center gap-4 shadow-lg">
        <button onClick={save} disabled={pending} className="btn-primary">
          {pending ? "Publishing…" : "Save and publish"}
        </button>
        {status && (
          <p className={status.ok ? "text-sm font-medium text-forest-700" : "error-text !mt-0"} role="status">
            {status.msg}
          </p>
        )}
      </div>
    </div>
  );
}
