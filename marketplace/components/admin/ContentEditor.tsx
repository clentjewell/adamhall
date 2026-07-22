"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  ArrowSquareOut,
  Clock,
  HandCoins,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Trash,
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
            <img
              src="/assets/logos/logo-white.svg"
              alt="Adam Hall — Buy My Car"
              className="h-8 w-auto"
            />
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
            <p className="helper">Format tel:0404290617 — used when someone taps Call.</p>
          </div>
        </div>
      </section>

      {/* ── About page hero ── */}
      <section>
        <SectionLabel where="About page — header" href="/about" />
        <div className="relative rounded-2xl overflow-hidden">
          <Image
            src={heroImages.home}
            alt=""
            width={1200}
            height={380}
            className="w-full h-[300px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-3">
            <Editable
              label="About page title"
              dark
              value={c.about.title}
              onChange={(v) => setC({ ...c, about: { ...c.about, title: v } })}
              className="font-display font-extrabold text-3xl leading-tight"
            />
            <Editable
              label="About page intro"
              dark
              multiline
              value={c.about.sub}
              onChange={(v) => setC({ ...c, about: { ...c.about, sub: v } })}
              className="text-stone-200"
            />
          </div>
        </div>
      </section>

      {/* ── About page sections ── */}
      <section>
        <SectionLabel where="About page — sections" href="/about" />
        <div className="card p-5 space-y-5 bg-white">
          {c.about.sections.map((section, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-400">
                  Section {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setC({
                      ...c,
                      about: { ...c.about, sections: c.about.sections.filter((_, j) => j !== i) },
                    })
                  }
                  disabled={c.about.sections.length <= 1}
                  className="btn-ghost !px-2 !py-1 text-xs text-red-700 hover:bg-red-50"
                >
                  <Trash size={14} weight="bold" />
                  Remove
                </button>
              </div>
              <Editable
                label={`Section ${i + 1} heading`}
                value={section.heading}
                onChange={(v) =>
                  setC({
                    ...c,
                    about: {
                      ...c.about,
                      sections: c.about.sections.map((s, j) => (j === i ? { ...s, heading: v } : s)),
                    },
                  })
                }
                className="font-bold"
              />
              <Editable
                label={`Section ${i + 1} body`}
                multiline
                value={section.body}
                onChange={(v) =>
                  setC({
                    ...c,
                    about: {
                      ...c.about,
                      sections: c.about.sections.map((s, j) => (j === i ? { ...s, body: v } : s)),
                    },
                  })
                }
                className="text-sm text-stone-600"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setC({
                ...c,
                about: {
                  ...c.about,
                  sections: [...c.about.sections, { heading: "New section", body: "" }],
                },
              })
            }
            disabled={c.about.sections.length >= 8}
            className="btn-ghost text-sm"
          >
            <Plus size={14} weight="bold" />
            Add section
          </button>
        </div>
      </section>

      {/* ── Contact page ── */}
      <section>
        <SectionLabel where="Contact page" href="/contact" />
        <div className="card p-5 space-y-5 bg-white">
          <Editable
            label="Contact page title"
            value={c.contact.title}
            onChange={(v) => setC({ ...c, contact: { ...c.contact, title: v } })}
            className="font-display font-bold text-xl"
          />
          <Editable
            label="Contact page intro"
            multiline
            value={c.contact.sub}
            onChange={(v) => setC({ ...c, contact: { ...c.contact, sub: v } })}
            className="text-sm text-stone-600"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label !mb-1">Email</label>
              <input
                className="input"
                value={c.contact.email}
                onChange={(e) => setC({ ...c, contact: { ...c.contact, email: e.target.value } })}
              />
            </div>
            <div>
              <label className="label !mb-1">Address</label>
              <textarea
                rows={2}
                className="input"
                value={c.contact.address}
                onChange={(e) => setC({ ...c, contact: { ...c.contact, address: e.target.value } })}
              />
              <p className="helper">One line per address part.</p>
            </div>
          </div>
          <div>
            <p className="label !mb-2">Opening hours</p>
            <div className="space-y-2">
              {c.contact.hours.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    aria-label={`Hours row ${i + 1} days`}
                    value={row.days}
                    onChange={(e) =>
                      setC({
                        ...c,
                        contact: {
                          ...c.contact,
                          hours: c.contact.hours.map((r, j) =>
                            j === i ? { ...r, days: e.target.value } : r,
                          ),
                        },
                      })
                    }
                    className="input flex-1"
                  />
                  <input
                    aria-label={`Hours row ${i + 1} hours`}
                    value={row.hours}
                    onChange={(e) =>
                      setC({
                        ...c,
                        contact: {
                          ...c.contact,
                          hours: c.contact.hours.map((r, j) =>
                            j === i ? { ...r, hours: e.target.value } : r,
                          ),
                        },
                      })
                    }
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setC({
                        ...c,
                        contact: { ...c.contact, hours: c.contact.hours.filter((_, j) => j !== i) },
                      })
                    }
                    disabled={c.contact.hours.length <= 1}
                    className="btn-ghost !px-2 !py-2 text-red-700 hover:bg-red-50"
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setC({
                  ...c,
                  contact: { ...c.contact, hours: [...c.contact.hours, { days: "", hours: "" }] },
                })
              }
              disabled={c.contact.hours.length >= 7}
              className="btn-ghost text-sm mt-2"
            >
              <Plus size={14} weight="bold" />
              Add row
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ page ── */}
      <section>
        <SectionLabel where="FAQ page" href="/faq" />
        <div className="card p-5 space-y-5 bg-white">
          <div className="relative rounded-2xl overflow-hidden">
            <Image
              src={heroImages.home}
              alt=""
              width={1200}
              height={300}
              className="w-full h-[160px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-2">
              <Editable
                label="FAQ page title"
                dark
                value={c.faq.title}
                onChange={(v) => setC({ ...c, faq: { ...c.faq, title: v } })}
                className="font-display font-extrabold text-2xl"
              />
              <Editable
                label="FAQ page intro"
                dark
                multiline
                value={c.faq.sub}
                onChange={(v) => setC({ ...c, faq: { ...c.faq, sub: v } })}
                className="text-stone-200 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            {c.faq.items.map((item, i) => (
              <div key={i} className="rounded-xl border border-stone-200 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <input
                    aria-label={`FAQ ${i + 1} group`}
                    value={item.group}
                    onChange={(e) =>
                      setC({
                        ...c,
                        faq: {
                          ...c.faq,
                          items: c.faq.items.map((x, j) =>
                            j === i ? { ...x, group: e.target.value } : x,
                          ),
                        },
                      })
                    }
                    className="bg-transparent rounded-md border border-dashed border-stone-300 focus:border-forest-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-stone-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setC({ ...c, faq: { ...c.faq, items: c.faq.items.filter((_, j) => j !== i) } })
                    }
                    disabled={c.faq.items.length <= 1}
                    className="btn-ghost !px-2 !py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    <Trash size={14} weight="bold" />
                    Remove
                  </button>
                </div>
                <Editable
                  label={`FAQ ${i + 1} question`}
                  value={item.q}
                  onChange={(v) =>
                    setC({
                      ...c,
                      faq: { ...c.faq, items: c.faq.items.map((x, j) => (j === i ? { ...x, q: v } : x)) },
                    })
                  }
                  className="font-semibold"
                />
                <Editable
                  label={`FAQ ${i + 1} answer`}
                  multiline
                  value={item.a}
                  onChange={(v) =>
                    setC({
                      ...c,
                      faq: { ...c.faq, items: c.faq.items.map((x, j) => (j === i ? { ...x, a: v } : x)) },
                    })
                  }
                  className="text-sm text-stone-600"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setC({
                ...c,
                faq: {
                  ...c.faq,
                  items: [
                    ...c.faq.items,
                    { group: c.faq.items.at(-1)?.group ?? "General", q: "New question", a: "" },
                  ],
                },
              })
            }
            disabled={c.faq.items.length >= 30}
            className="btn-ghost text-sm"
          >
            <Plus size={14} weight="bold" />
            Add question
          </button>
          <p className="text-xs text-stone-400">Questions appear grouped by the Group name.</p>
        </div>
      </section>

      {/* ── Finance page ── */}
      <section>
        <SectionLabel where="Finance page — header" href="/finance" />
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
              label="Finance page title"
              dark
              value={c.financePage.title}
              onChange={(v) => setC({ ...c, financePage: { ...c.financePage, title: v } })}
              className="font-display font-extrabold text-2xl"
            />
            <Editable
              label="Finance page intro"
              dark
              multiline
              value={c.financePage.sub}
              onChange={(v) => setC({ ...c, financePage: { ...c.financePage, sub: v } })}
              className="text-stone-200 text-sm"
            />
          </div>
        </div>
      </section>

      <section>
        <SectionLabel where="Finance page — how it works steps" href="/finance" />
        <div className="card p-5 grid gap-5 sm:grid-cols-3 bg-white">
          {c.financePage.steps.map((step, i) => (
            <div key={i} className="space-y-1.5">
              <Editable
                label={`Finance step ${i + 1} heading`}
                value={step.title}
                onChange={(v) =>
                  setC({
                    ...c,
                    financePage: {
                      ...c.financePage,
                      steps: c.financePage.steps.map((s, j) => (j === i ? { ...s, title: v } : s)),
                    },
                  })
                }
                className="font-bold text-sm"
              />
              <Editable
                label={`Finance step ${i + 1} body`}
                multiline
                value={step.body}
                onChange={(v) =>
                  setC({
                    ...c,
                    financePage: {
                      ...c.financePage,
                      steps: c.financePage.steps.map((s, j) => (j === i ? { ...s, body: v } : s)),
                    },
                  })
                }
                className="text-xs text-stone-600"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Legal pages ── */}
      <section>
        <SectionLabel where="Legal pages" href="/legal/privacy" />
        <p className="text-xs text-stone-400 mb-3">
          The DRAFT banner and finance disclaimers stay fixed — legal wording can&apos;t be edited
          away by accident.
        </p>
        <div className="space-y-5">
          {(
            [
              { key: "privacy", label: "Privacy Policy", href: "/legal/privacy" },
              { key: "terms", label: "Terms of Use", href: "/legal/terms" },
              {
                key: "financeDisclaimer",
                label: "Finance Disclaimer",
                href: "/legal/finance-disclaimer",
              },
              {
                key: "websiteDisclaimer",
                label: "Website Disclaimer",
                href: "/legal/website-disclaimer",
              },
              { key: "complaints", label: "Complaints", href: "/legal/complaints" },
            ] as const
          ).map((doc) => (
            <div key={doc.key} className="card p-5 bg-white">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-bold text-sm">{doc.label}</span>
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:underline"
                >
                  Open page
                  <ArrowSquareOut size={12} weight="bold" />
                </a>
              </div>
              <textarea
                aria-label={`${doc.label} text`}
                rows={12}
                value={c.legal[doc.key]}
                onChange={(e) => setC({ ...c, legal: { ...c.legal, [doc.key]: e.target.value } })}
                className="w-full bg-white rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 resize-y"
              />
              <p className="helper">
                Lines starting &quot;## &quot; become headings; blank lines split paragraphs.
              </p>
            </div>
          ))}
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
