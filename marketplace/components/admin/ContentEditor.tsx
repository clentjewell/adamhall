"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  ArrowSquareOut,
  Clock,
  HandCoins,
  Phone,
  ShieldCheck,
  Star,
} from "@phosphor-icons/react";
import { saveSiteContent } from "@/app/actions/content";
import { heroImages } from "@/lib/heroes";
import type { SiteContent } from "@/lib/content";

// WYSIWYG-style copy editor: each section is a visual replica of the real
// page region with the text editable in place, so what Adam types is what
// the site shows. Dashed outlines mark what's editable.

const WHY_ICONS = [ShieldCheck, HandCoins, Clock];

function Editable({
  value,
  onChange,
  dark = false,
  multiline = false,
  className = "",
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  dark?: boolean;
  multiline?: boolean;
  className?: string;
  label: string;
}) {
  const base = `w-full bg-transparent rounded-md border border-dashed px-2 py-1 focus:outline-none transition-colors ${
    dark
      ? "border-white/30 focus:border-white text-inherit placeholder:text-white/40"
      : "border-stone-300 focus:border-forest-600 text-inherit placeholder:text-stone-400"
  } ${className}`;
  return multiline ? (
    <textarea
      aria-label={label}
      value={value}
      rows={2}
      onChange={(e) => onChange(e.target.value)}
      className={`${base} resize-none`}
    />
  ) : (
    <input
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={base}
    />
  );
}

function SectionLabel({ where, href }: { where: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-2">
      <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
        {where}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:underline"
      >
        Open page
        <ArrowSquareOut size={12} weight="bold" />
      </a>
    </div>
  );
}

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
          ? { ok: true, msg: "Published. Refresh the site in a few seconds to see it." }
          : { ok: false, msg: r.error ?? "Couldn't save." },
      );
    });

  return (
    <div className="space-y-8 max-w-3xl pb-24">
      {/* ── Home hero, on the real artwork ── */}
      <section>
        <SectionLabel where="Home page — hero" href="/" />
        <div className="relative rounded-2xl overflow-hidden">
          <Image
            src={heroImages.home}
            alt=""
            width={1200}
            height={675}
            className="w-full h-[380px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-3">
            <Editable
              label="Hero headline"
              dark
              value={c.hero.headline}
              onChange={(v) => setC({ ...c, hero: { ...c.hero, headline: v } })}
              className="font-display font-extrabold uppercase text-3xl leading-tight"
            />
            <Editable
              label="Hero subtext"
              dark
              multiline
              value={c.hero.subtext}
              onChange={(v) => setC({ ...c, hero: { ...c.hero, subtext: v } })}
              className="text-stone-200"
            />
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2">
                <input
                  aria-label="Main hero button label"
                  value={c.hero.ctaPrimary}
                  onChange={(e) => setC({ ...c, hero: { ...c.hero, ctaPrimary: e.target.value } })}
                  size={Math.max(c.hero.ctaPrimary.length, 6)}
                  className="bg-transparent text-forest-800 font-semibold text-sm focus:outline-none border-b border-dashed border-forest-300 focus:border-forest-700"
                />
                <ArrowRight size={14} weight="bold" className="text-forest-800" />
              </span>
              <span className="inline-flex items-center rounded-full border-2 border-white/70 px-4 py-2">
                <input
                  aria-label="Second hero button label"
                  value={c.hero.ctaSecondary}
                  onChange={(e) => setC({ ...c, hero: { ...c.hero, ctaSecondary: e.target.value } })}
                  size={Math.max(c.hero.ctaSecondary.length, 6)}
                  className="bg-transparent text-white font-semibold text-sm focus:outline-none border-b border-dashed border-white/40 focus:border-white"
                />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section>
        <SectionLabel where="Home page — why people deal with Adam" href="/" />
        <div className="card p-5 grid gap-5 sm:grid-cols-3 bg-white">
          {c.why.map((point, i) => {
            const Icon = WHY_ICONS[i % 3];
            return (
              <div key={i} className="flex gap-3">
                <Icon size={26} className="text-forest-600 shrink-0" weight="duotone" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Editable
                    label={`Trust point ${i + 1} title`}
                    value={point.title}
                    onChange={(v) =>
                      setC({ ...c, why: c.why.map((x, j) => (j === i ? { ...x, title: v } : x)) })
                    }
                    className="font-bold text-sm"
                  />
                  <Editable
                    label={`Trust point ${i + 1} detail`}
                    multiline
                    value={point.body}
                    onChange={(v) =>
                      setC({ ...c, why: c.why.map((x, j) => (j === i ? { ...x, body: v } : x)) })
                    }
                    className="text-xs text-stone-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Sell band ── */}
      <section>
        <SectionLabel where="Home page — green selling band" href="/" />
        <div className="rounded-2xl bg-forest-700 p-6 text-white space-y-3">
          <Editable
            label="Sell band heading"
            dark
            value={c.sellBand.heading}
            onChange={(v) => setC({ ...c, sellBand: { ...c.sellBand, heading: v } })}
            className="font-display font-bold text-2xl"
          />
          <Editable
            label="Sell band body"
            dark
            multiline
            value={c.sellBand.body}
            onChange={(v) => setC({ ...c, sellBand: { ...c.sellBand, body: v } })}
            className="text-forest-100 text-sm"
          />
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2">
            <input
              aria-label="Sell band button label"
              value={c.sellBand.cta}
              onChange={(e) => setC({ ...c, sellBand: { ...c.sellBand, cta: e.target.value } })}
              size={Math.max(c.sellBand.cta.length, 6)}
              className="bg-transparent text-forest-700 font-semibold text-sm focus:outline-none border-b border-dashed border-forest-300 focus:border-forest-700"
            />
            <ArrowRight size={14} weight="bold" className="text-forest-700" />
          </span>
        </div>
      </section>

      {/* ── Cars page hero ── */}
      <section>
        <SectionLabel where="Cars for sale page — header" href="/cars" />
        <div className="relative rounded-2xl overflow-hidden">
          <Image
            src={heroImages.cars}
            alt=""
            width={1200}
            height={400}
            className="w-full h-[200px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-2">
            <Editable
              label="Cars page title"
              dark
              value={c.carsHero.title}
              onChange={(v) => setC({ ...c, carsHero: { ...c.carsHero, title: v } })}
              className="font-display font-extrabold text-2xl"
            />
            <Editable
              label="Cars page intro"
              dark
              multiline
              value={c.carsHero.sub}
              onChange={(v) => setC({ ...c, carsHero: { ...c.carsHero, sub: v } })}
              className="text-stone-200 text-sm"
            />
          </div>
        </div>
      </section>

      {/* ── Sell page hero ── */}
      <section>
        <SectionLabel where="Sell your car page — header" href="/sell" />
        <div className="relative rounded-2xl overflow-hidden">
          <Image
            src={heroImages.sell}
            alt=""
            width={1200}
            height={400}
            className="w-full h-[200px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-2">
            <Editable
              label="Sell page title"
              dark
              value={c.sellHero.title}
              onChange={(v) => setC({ ...c, sellHero: { ...c.sellHero, title: v } })}
              className="font-display font-extrabold text-2xl"
            />
            <Editable
              label="Sell page intro"
              dark
              multiline
              value={c.sellHero.sub}
              onChange={(v) => setC({ ...c, sellHero: { ...c.sellHero, sub: v } })}
              className="text-stone-200 text-sm"
            />
          </div>
        </div>
      </section>

      {/* ── Reviews strip ── */}
      <section>
        <SectionLabel where="Home + sell pages — reviews strip" href="/" />
        <div className="rounded-2xl bg-forest-800 p-5 text-white space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex gap-0.5" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} weight="fill" className="text-amber-accent" />
              ))}
            </span>
            <input
              aria-label="Google rating"
              value={String(c.reviews.rating)}
              onChange={(e) =>
                setC({ ...c, reviews: { ...c.reviews, rating: Number(e.target.value) || 0 } })
              }
              size={3}
              className="bg-transparent font-semibold focus:outline-none border-b border-dashed border-white/40 focus:border-white text-center"
            />
            <span className="font-semibold">from</span>
            <input
              aria-label="Review count"
              value={String(c.reviews.count)}
              onChange={(e) =>
                setC({ ...c, reviews: { ...c.reviews, count: Number(e.target.value) || 0 } })
              }
              size={4}
              className="bg-transparent font-semibold focus:outline-none border-b border-dashed border-white/40 focus:border-white text-center"
            />
            <span className="font-semibold">Google reviews</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {c.reviews.quotes.map((q, i) => (
              <div key={i} className="rounded-xl bg-forest-700/60 border border-forest-500/30 p-4 space-y-2">
                <Editable
                  label={`Review quote ${i + 1}`}
                  dark
                  multiline
                  value={q.text}
                  onChange={(v) =>
                    setC({
                      ...c,
                      reviews: {
                        ...c.reviews,
                        quotes: c.reviews.quotes.map((x, j) => (j === i ? { ...x, text: v } : x)),
                      },
                    })
                  }
                  className="text-forest-50 text-xs leading-relaxed !h-24"
                />
                <div className="flex gap-2">
                  <Editable
                    label={`Reviewer ${i + 1} name`}
                    dark
                    value={q.author}
                    onChange={(v) =>
                      setC({
                        ...c,
                        reviews: {
                          ...c.reviews,
                          quotes: c.reviews.quotes.map((x, j) => (j === i ? { ...x, author: v } : x)),
                        },
                      })
                    }
                    className="text-xs font-semibold text-forest-200"
                  />
                  <Editable
                    label={`Reviewer ${i + 1} suburb`}
                    dark
                    value={q.suburb}
                    onChange={(v) =>
                      setC({
                        ...c,
                        reviews: {
                          ...c.reviews,
                          quotes: c.reviews.quotes.map((x, j) => (j === i ? { ...x, suburb: v } : x)),
                        },
                      })
                    }
                    className="text-xs font-semibold text-forest-200"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-forest-200/80">
            Only use genuine reviews — these show publicly with the Google rating.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <section>
        <SectionLabel where="Every page — footer" href="/" />
        <div className="rounded-2xl bg-ink p-6 text-stone-300 grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="font-display font-extrabold text-white">ADAM HALL</p>
            <Editable
              label="Footer blurb"
              dark
              multiline
              value={c.footer.blurb}
              onChange={(v) => setC({ ...c, footer: { ...c.footer, blurb: v } })}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-white text-sm">The deal with us</p>
            <textarea
              aria-label="Footer deal points, one per line"
              rows={4}
              value={c.footer.deal.join("\n")}
              onChange={(e) =>
                setC({
                  ...c,
                  footer: { ...c.footer, deal: e.target.value.split("\n").filter((l) => l.trim()) },
                })
              }
              className="w-full bg-transparent rounded-md border border-dashed border-white/30 focus:border-white px-2 py-1 text-sm focus:outline-none resize-none"
            />
            <p className="text-xs text-stone-500">One point per line.</p>
          </div>
        </div>
      </section>

      {/* ── Phone (header preview) ── */}
      <section>
        <SectionLabel where="Every page — header phone button" href="/" />
        <div className="card p-5 flex flex-wrap items-center gap-5 bg-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest-600 px-4 py-2.5 text-white">
            <Phone size={16} weight="bold" />
            <input
              aria-label="Phone number shown on the site"
              value={c.phone.display}
              onChange={(e) => setC({ ...c, phone: { ...c.phone, display: e.target.value } })}
              size={Math.max(c.phone.display.length, 8)}
              className="bg-transparent font-semibold text-sm focus:outline-none border-b border-dashed border-white/40 focus:border-white"
            />
          </span>
          <div className="flex-1 min-w-[220px]">
            <label className="label !mb-1">Dial link</label>
            <input
              className="input"
              value={c.phone.tel}
              onChange={(e) => setC({ ...c, phone: { ...c.phone, tel: e.target.value } })}
            />
            <p className="helper">Format tel:+61400000000 — used when someone taps Call.</p>
          </div>
        </div>
      </section>

      {/* ── Save bar ── */}
      <div className="sticky bottom-4 card p-4 flex items-center gap-4 shadow-lg bg-white">
        <button onClick={save} disabled={pending} className="btn-primary">
          {pending ? "Publishing…" : "Save and publish"}
        </button>
        {status && (
          <p className={status.ok ? "text-sm font-medium text-forest-700" : "error-text !mt-0"} role="status">
            {status.msg}
          </p>
        )}
        <p className="ml-auto hidden sm:block text-xs text-stone-400 max-w-[26ch]">
          Dashed boxes are editable. Blank a field to restore the original wording.
        </p>
      </div>
    </div>
  );
}
