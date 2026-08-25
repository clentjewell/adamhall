"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Star, Quotes, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import type { ReviewQuote } from "@/lib/content";

const EASE = [0.16, 1, 0.3, 1] as const;
const HOLD_MS = 6500;

// Deterministic brand tints so a given name always keeps the same monogram
// colour across renders — no random flicker, no client/server mismatch.
const TINTS = [
  { bg: "#1e5c41", ring: "#2e6e4e" }, // forest-600 / 500
  { bg: "#c47b0a", ring: "#e0982a" }, // amber
  { bg: "#123a29", ring: "#2e6e4e" }, // forest-800
  { bg: "#3f4a3a", ring: "#6b7a5e" }, // warm stone
] as const;

function initials(name: string) {
  const parts = name.replace(/[^a-zA-Z .]/g, "").trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "★";
}

function tintFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

function Avatar({
  q,
  size,
  active,
}: {
  q: ReviewQuote;
  size: number;
  active: boolean;
}) {
  const tint = tintFor(q.author);
  const ring = active ? "#e0982a" : "transparent";
  if (q.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={q.avatar}
        alt={q.author}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size, boxShadow: `0 0 0 2px ${ring}` }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="rounded-full grid place-items-center font-display font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(150deg, ${tint.ring}, ${tint.bg})`,
        fontSize: size * 0.4,
        boxShadow: `0 0 0 2px ${ring}`,
      }}
    >
      {initials(q.author)}
    </span>
  );
}

export default function Reviews({
  rating,
  count,
  quotes,
}: {
  rating: number;
  count: number;
  quotes: ReviewQuote[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = quotes.length;

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + n) % n),
    [n],
  );

  // Apple-keynote auto-advance: hold on each quote, pause on hover/focus,
  // and stay put entirely for reduced-motion visitors.
  useEffect(() => {
    if (reduce || paused || n < 2) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % n), HOLD_MS);
    return () => clearTimeout(t);
  }, [active, paused, reduce, n]);

  const q = quotes[active];

  return (
    <section
      aria-label="Customer reviews"
      className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden bg-ink text-white py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Atmosphere: a vast, barely-there quote mark + forest glow so the
          stage reads as depth, not a flat panel. */}
      <Quotes
        aria-hidden
        weight="fill"
        className="pointer-events-none absolute -top-10 -left-6 text-forest-700/40 md:text-forest-700/50"
        style={{ fontSize: "min(46vw, 34rem)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/3 left-1/2 -translate-x-1/2 h-[70vh] w-[70vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(30,92,65,0.45), transparent 65%)" }}
      />

      <div className="relative w-full max-w-4xl mx-auto px-6 text-center">
        {/* Aggregate — the one number that carries the trust */}
        <p className="text-xs font-semibold tracking-[0.35em] text-forest-200/80 uppercase">
          What people say
        </p>
        <div className="mt-5 flex items-end justify-center gap-4">
          <span className="font-display font-extrabold leading-none text-7xl md:text-8xl">
            {rating}
          </span>
          <div className="pb-1.5 text-left">
            <div className="flex gap-0.5" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} weight="fill" className="text-amber-accent" />
              ))}
            </div>
            <p className="mt-1 text-sm text-stone-300">
              from {count} Google reviews
            </p>
          </div>
        </div>

        {/* Featured quote — one at a time, crossfading like a keynote slide */}
        <div className="relative mt-14 min-h-[15rem] md:min-h-[16rem] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.figure
              key={active}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="w-full"
            >
              <blockquote
                data-edit={`reviews.quotes.${active}.text`}
                aria-live="polite"
                className="font-display font-semibold text-2xl md:text-4xl leading-[1.15] text-balance max-w-3xl mx-auto"
              >
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center justify-center gap-3">
                <Avatar q={q} size={44} active />
                <span className="text-left">
                  <span
                    data-edit={`reviews.quotes.${active}.author`}
                    className="block font-semibold leading-tight"
                  >
                    {q.author}
                  </span>
                  <span
                    data-edit={`reviews.quotes.${active}.suburb`}
                    className="block text-sm text-stone-400 leading-tight"
                  >
                    {q.suburb}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Reviewer avatars — the "who said it" row, and the selector */}
        <div className="mt-14 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous review"
            className="hidden sm:grid place-items-center w-9 h-9 rounded-full border border-white/15 text-stone-300 hover:text-white hover:border-white/40 transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
          </button>

          <ul className="flex items-center gap-2.5">
            {quotes.map((rq, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Read ${rq.author}'s review`}
                  aria-current={i === active}
                  className="block rounded-full transition-[transform,opacity] duration-300 hover:opacity-100"
                  style={{
                    transform: i === active ? "scale(1.12)" : "scale(1)",
                    opacity: i === active ? 1 : 0.5,
                  }}
                >
                  <Avatar q={rq} size={i === active ? 44 : 38} active={i === active} />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next review"
            className="hidden sm:grid place-items-center w-9 h-9 rounded-full border border-white/15 text-stone-300 hover:text-white hover:border-white/40 transition-colors"
          >
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>

        <p className="mt-8 text-xs text-stone-500">
          Sample reviews shown while the live Google feed is connected
        </p>
      </div>
    </section>
  );
}
