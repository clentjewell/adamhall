"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Phone, TrendDown, TrendUp } from "@phosphor-icons/react";
import { getInstantQuote, type QuotePayload } from "@/app/actions/quote";
import type { ValuationResult } from "@/lib/valuation";
import { formatKm, formatPrice } from "@/lib/format";
import {
  DUR,
  EASE_ENTRANCE,
  EASE_EXIT,
  EASE_STANDARD,
} from "@/components/motion/Reveal";

const CONDITIONS: { value: QuotePayload["condition"]; label: string; hint: string }[] =
  [
    { value: "excellent", label: "Excellent", hint: "Looks near new, no marks" },
    { value: "very_good", label: "Very good", hint: "Tidy, a couple of small marks" },
    { value: "good", label: "Good", hint: "Honest car, some wear" },
    { value: "fair", label: "Fair", hint: "Needs a bit of work" },
  ];

const SERVICE: { value: QuotePayload["service_history"]; label: string }[] = [
  { value: "full", label: "Full book" },
  { value: "partial", label: "Some of it" },
  { value: "none", label: "None" },
  { value: "unknown", label: "Not sure" },
];

const CONFIDENCE_LABEL: Record<"high" | "medium" | "low", string> = {
  high: "Tight range",
  medium: "Fair guide",
  low: "Wide guide",
};

/** Slider ceiling. The maths accepts up to 500,000 km via the type-in field. */
const SLIDER_MAX_KM = 300_000;

interface Form {
  make: string;
  model: string;
  year: string;
  odometer_km: string;
  condition: QuotePayload["condition"];
  service_history: QuotePayload["service_history"];
  had_accidents: "" | "yes" | "no";
  suburb: string;
}

const emptyForm: Form = {
  make: "",
  model: "",
  year: "",
  odometer_km: "",
  condition: "very_good",
  service_history: "full",
  had_accidents: "",
  suburb: "",
};

/** The fields that re-run the estimate live once a range is on screen.
    Make, model and year change *which car* it is, so they ask for a fresh
    submit instead of silently re-quoting a half-typed name. */
const LIVE_KEYS: (keyof Form)[] = [
  "odometer_km",
  "condition",
  "service_history",
  "had_accidents",
];

function carKey(f: Pick<Form, "make" | "model" | "year">): string {
  return [f.make, f.model, f.year]
    .map((s) => s.trim().toLowerCase().replace(/\s+/g, " "))
    .join("|");
}

function formComplete(f: Form): boolean {
  return Boolean(
    f.make.trim() &&
      f.model.trim() &&
      f.year.length === 4 &&
      f.odometer_km &&
      f.had_accidents,
  );
}

/** Carry the details through to the full flow so nothing is typed twice. */
function sellHref(form: Form): string {
  const q = new URLSearchParams({
    make: form.make.trim(),
    model: form.model.trim(),
    year: form.year,
    km: form.odometer_km,
    service: form.service_history,
    accidents: form.had_accidents === "yes" ? "yes" : "no",
  });
  if (form.suburb.trim()) q.set("suburb", form.suburb.trim());
  return `/sell?${q.toString()}`;
}

/** Ranges are quoted to the nearest $100, so the roll keeps that grain. */
const formatRoughPrice = (v: number) => formatPrice(Math.round(v / 100) * 100);

/** The estimate window the range bar draws inside. Wider than the range
    itself so the band has room to slide as the seller adjusts the car. */
interface BarWindow {
  min: number;
  max: number;
}

function makeWindow(low: number, high: number, midpoint: number): BarWindow {
  const span = Math.max(high - low, midpoint * 0.12);
  return { min: Math.max(0, low - span * 1.6), max: high + span * 1.6 };
}

export default function InstantQuote({
  phone,
}: {
  /** Comes straight from site content, so there is one phone number sitewide. */
  phone: { display: string; tel: string };
}) {
  const [form, setForm] = useState<Form>(emptyForm);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [delta, setDelta] = useState<number | null>(null);
  const [barWindow, setBarWindow] = useState<BarWindow | null>(null);
  const reduce = useReducedMotion() ?? false;

  // Which car the range on screen belongs to, so edits to make/model/year
  // mark it stale instead of live-quoting a half-typed name.
  const quotedCarRef = useRef<string | null>(null);
  const lastMidRef = useRef<number | null>(null);
  const seqRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
    },
    [],
  );

  async function runQuote(f: Form, live: boolean) {
    const seq = ++seqRef.current;
    if (live) setRefreshing(true);
    else {
      setPending(true);
      setResult(null);
    }

    const res = await getInstantQuote({
      make: f.make,
      model: f.model,
      year: Number(f.year),
      odometer_km: Number(f.odometer_km),
      condition: f.condition,
      service_history: f.service_history,
      had_accidents: f.had_accidents === "yes",
      suburb: f.suburb || undefined,
    });
    if (seq !== seqRef.current) return; // a newer request is in flight

    setPending(false);
    setRefreshing(false);

    if (!res.ok || !res.result) {
      setError(res.error ?? "Something went wrong. Please try again.");
      return;
    }

    const next = res.result;
    const key = carKey(f);
    const sameCar = quotedCarRef.current === key;

    // Movement chip: only when the same car's number actually moved.
    if (next.ok && sameCar && lastMidRef.current != null) {
      const moved = next.midpoint - lastMidRef.current;
      if (moved !== 0) {
        setDelta(moved);
        if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
        deltaTimerRef.current = setTimeout(() => setDelta(null), 2400);
      }
    }

    if (next.ok) {
      lastMidRef.current = next.midpoint;
      setBarWindow((w) => {
        if (!w || !sameCar || next.low < w.min || next.high > w.max) {
          return makeWindow(next.low, next.high, next.midpoint);
        }
        return w;
      });
    }
    quotedCarRef.current = key;
    setResult(next);
  }

  const set = (patch: Partial<Form>) => {
    setError(null);
    const nextForm = { ...form, ...patch };
    setForm(nextForm);

    // Once a range is on screen, the panel follows the controls live.
    const touchesLive = Object.keys(patch).some((k) =>
      LIVE_KEYS.includes(k as keyof Form),
    );
    if (
      touchesLive &&
      result &&
      quotedCarRef.current === carKey(nextForm) &&
      formComplete(nextForm)
    ) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runQuote(nextForm, true), 450);
    }
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.make.trim() || !form.model.trim()) {
      setError("We need the make and model to work from.");
      return;
    }
    if (!form.year) {
      setError("What year is it?");
      return;
    }
    if (!form.odometer_km) {
      setError("Roughly how many kays has it done?");
      return;
    }
    if (!form.had_accidents) {
      setError("Let us know whether it has been in an accident.");
      return;
    }
    void runQuote(form, false);
  }

  // The car named in the form no longer matches the range on screen.
  const stale = Boolean(result && quotedCarRef.current !== carKey(form));

  const sliderKm = Math.min(Number(form.odometer_km) || 0, SLIDER_MAX_KM);

  // Standard token for state changes between two on-screen states
  // (identity section 13). Instant under reduced motion.
  const t = reduce
    ? { duration: 0 }
    : { duration: DUR.standard, ease: EASE_STANDARD };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      {/* ---- The car ------------------------------------------------- */}
      <form onSubmit={onSubmit} noValidate>
        <fieldset disabled={pending} className="disabled:opacity-60">
          <legend className="sr-only">Your car&apos;s details</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="q-make">
                Make
              </label>
              <input
                id="q-make"
                className="input"
                value={form.make}
                onChange={(e) => set({ make: e.target.value })}
                placeholder="Toyota"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label" htmlFor="q-model">
                Model
              </label>
              <input
                id="q-model"
                className="input"
                value={form.model}
                onChange={(e) => set({ model: e.target.value })}
                placeholder="RAV4"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label" htmlFor="q-year">
                Year
              </label>
              <input
                id="q-year"
                className="input tabular"
                inputMode="numeric"
                value={form.year}
                onChange={(e) =>
                  set({ year: e.target.value.replace(/\D/g, "").slice(0, 4) })
                }
                placeholder="2019"
              />
            </div>
            <div>
              <label className="label" htmlFor="q-km">
                Kilometres
              </label>
              <input
                id="q-km"
                className="input tabular"
                inputMode="numeric"
                value={form.odometer_km}
                onChange={(e) =>
                  set({ odometer_km: e.target.value.replace(/\D/g, "").slice(0, 7) })
                }
                placeholder="86000"
              />
              {/* The same number as a slider, so the odometer can be wound
                  up and down and the range panel answers as it moves. */}
              <input
                type="range"
                aria-label="Kilometres, slider"
                className="mt-2 w-full accent-forest-600"
                min={0}
                max={SLIDER_MAX_KM}
                step={1000}
                value={sliderKm}
                onChange={(e) => set({ odometer_km: e.target.value })}
              />
              <p className="helper !mt-0 tabular">
                {form.odometer_km ? formatKm(Number(form.odometer_km)) : "Slide or type"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <span className="label" id="q-condition-label">
              Condition
            </span>
            <div
              className="grid gap-2 sm:grid-cols-2"
              role="group"
              aria-labelledby="q-condition-label"
            >
              {CONDITIONS.map((c) => {
                const active = form.condition === c.value;
                return (
                  <label
                    key={c.value}
                    className={`relative flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                      active
                        ? "border-transparent"
                        : "border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="iq-condition-active"
                        className="absolute inset-0 rounded-lg border-2 border-forest-600 bg-forest-50"
                        transition={t}
                        aria-hidden="true"
                      />
                    )}
                    <input
                      type="radio"
                      name="condition"
                      className="relative mt-1 accent-forest-600"
                      checked={active}
                      onChange={() => set({ condition: c.value })}
                    />
                    <span className="relative">
                      <span className="block font-semibold">{c.label}</span>
                      <span className="block text-sm text-meta">{c.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <span className="label" id="q-service-label">
              Service history
            </span>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="q-service-label"
            >
              {SERVICE.map((s) => {
                const active = form.service_history === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set({ service_history: s.value })}
                    className={`relative rounded-full border px-4 py-2 text-sm font-semibold ${
                      active
                        ? "border-transparent text-white"
                        : "border-stone-300 text-ink hover:bg-stone-50"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="iq-service-active"
                        className="absolute inset-0 rounded-full bg-forest-600"
                        transition={t}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="label" id="q-accident-label">
                Has it been in an accident?
              </span>
              <div
                className="flex gap-2"
                role="group"
                aria-labelledby="q-accident-label"
              >
                {(["no", "yes"] as const).map((v) => {
                  const active = form.had_accidents === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={active}
                      onClick={() => set({ had_accidents: v })}
                      className={`relative rounded-full border px-5 py-2 font-semibold ${
                        active
                          ? "border-transparent text-white"
                          : "border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="iq-accident-active"
                          className="absolute inset-0 rounded-full bg-forest-600"
                          transition={t}
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative">{v === "no" ? "No" : "Yes"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="q-suburb">
                Suburb <span className="font-normal text-meta">(optional)</span>
              </label>
              <input
                id="q-suburb"
                className="input"
                value={form.suburb}
                onChange={(e) => set({ suburb: e.target.value })}
                placeholder="Tweed Heads"
                autoComplete="address-level2"
              />
            </div>
          </div>
          <p className="helper">
            Repaired damage is fine, and telling us now saves a surprise later.
          </p>

          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-cta mt-6 w-full sm:w-auto">
            {pending
              ? "Working it out"
              : stale
                ? "Price this car instead"
                : "See what it is worth"}
            {!pending && <ArrowRight size={18} weight="bold" />}
          </button>
        </fieldset>
      </form>

      {/* ---- The number --------------------------------------------- */}
      <div className="lg:pl-2">
        <div className="lg:sticky lg:top-24">
          {!result && !pending && (
            <div className="card h-full p-6">
              <p className="type-lead text-meta">
                Fill in the car on the left and we will show you the range it
                sits in, straight away. No account, no contact details, just the
                range.
              </p>
              {/* A ghost of the range bar, so the panel promises the exact
                  thing it is about to draw. */}
              <div
                className="mt-6 h-2.5 overflow-hidden rounded-full bg-stone-200"
                aria-hidden="true"
              >
                <div className="ml-[30%] h-full w-[40%] bg-stone-300" />
              </div>
              <p className="mt-4 text-sm text-meta">
                We work from cars Adam has bought and sold himself. If we have
                not seen one like yours recently, we say so instead of guessing.
              </p>
            </div>
          )}

          {pending && (
            <div className="card h-full space-y-3 p-6" aria-live="polite">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-2.5 w-full !rounded-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          )}

          {result && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: stale ? 0.45 : 1, y: 0 }}
              // Entrance token from the identity: arrives fast, settles.
              transition={{ duration: DUR.entrance, ease: EASE_ENTRANCE }}
              className="card overflow-hidden"
              aria-live="polite"
            >
              {result.ok ? (
                <>
                  <div className="bg-forest-600 px-6 py-5 text-white">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="type-label text-white/80">
                        Indicative range
                      </p>
                      <span className="flex items-center gap-2">
                        {refreshing && (
                          <span className="type-caption text-white/70">
                            updating…
                          </span>
                        )}
                        <AnimatePresence>
                          {delta != null && (
                            <motion.span
                              key={delta}
                              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: reduce
                                  ? { duration: 0 }
                                  : { duration: DUR.standard, ease: EASE_STANDARD },
                              }}
                              exit={{
                                opacity: 0,
                                transition: reduce
                                  ? { duration: 0 }
                                  : { duration: DUR.instant, ease: EASE_EXIT },
                              }}
                              className="tabular inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold"
                            >
                              {delta > 0 ? (
                                <TrendUp size={14} weight="bold" />
                              ) : (
                                <TrendDown size={14} weight="bold" />
                              )}
                              {delta > 0 ? "+" : "−"}
                              {formatPrice(Math.abs(delta))}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </div>
                    {/* Prices never count up and never flicker on change
                        (identity section 13). The figures simply update;
                        the bar below and the movement chip carry the change. */}
                    <p className="type-price-lg mt-1">
                      {formatRoughPrice(result.low)} to {formatRoughPrice(result.high)}
                    </p>

                    {/* The range, drawn. The band slides and stretches as the
                        details change; the tick is the midpoint. */}
                    {barWindow && (
                      <div className="mt-4" aria-hidden="true">
                        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/20">
                          <motion.div
                            className="absolute inset-0"
                            animate={{
                              x: `${
                                ((result.low - barWindow.min) /
                                  (barWindow.max - barWindow.min)) *
                                100
                              }%`,
                            }}
                            transition={t}
                          >
                            <motion.div
                              className="absolute inset-y-0 left-0 w-full bg-sand"
                              style={{ transformOrigin: "left" }}
                              animate={{
                                scaleX: Math.max(
                                  (result.high - result.low) /
                                    (barWindow.max - barWindow.min),
                                  0.03,
                                ),
                              }}
                              transition={t}
                            />
                          </motion.div>
                          <motion.div
                            className="absolute inset-0"
                            animate={{
                              x: `${
                                ((result.midpoint - barWindow.min) /
                                  (barWindow.max - barWindow.min)) *
                                100
                              }%`,
                            }}
                            transition={t}
                          >
                            <div className="absolute inset-y-0 left-0 w-0.5 bg-forest-800" />
                          </motion.div>
                        </div>
                        <p className="tabular mt-1.5 text-xs text-white/70">
                          midpoint {formatPrice(result.midpoint)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="flex items-center gap-1"
                        aria-hidden="true"
                      >
                        {([1, 2, 3] as const).map((step) => (
                          <span
                            key={step}
                            className={`h-1.5 w-5 rounded-full ${
                              step <=
                              (result.confidence === "high"
                                ? 3
                                : result.confidence === "medium"
                                  ? 2
                                  : 1)
                                ? "bg-forest-600"
                                : "bg-stone-200"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {CONFIDENCE_LABEL[result.confidence]}
                      </span>
                      <span className="text-sm text-meta">
                        · {result.comparableCount}{" "}
                        {result.comparableCount === 1 ? "car" : "cars"} compared
                      </span>
                    </div>

                    <p className="text-ink">{result.basis}</p>

                    <p className="rounded-lg bg-forest-50 p-3 text-sm text-ink">
                      Change the condition or wind the kays up and down on the
                      left, and the range follows as you go.
                    </p>

                    {result.confidence === "low" && (
                      <p className="text-sm text-ink">
                        Treat this one as a wide guide. Adam will tighten it once
                        he has seen the car.
                      </p>
                    )}

                    <p className="text-sm text-meta">
                      This is an estimate, not an offer. The real number comes
                      after Adam looks the car over, and it can move either way.
                      Nothing here commits you or him to anything.
                    </p>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                      <Link href={sellHref(form)} className="btn-cta">
                        Get Adam&apos;s real offer
                        <ArrowRight size={18} weight="bold" />
                      </Link>
                      <a href={phone.tel} className="btn-secondary">
                        <Phone size={18} weight="fill" />
                        {phone.display}
                      </a>
                    </div>
                    <p className="text-sm text-meta">
                      The full form takes about five minutes. Adam looks over
                      every car himself.
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4 p-6">
                  <p className="type-label text-meta">
                    No instant number for this one
                  </p>
                  <p className="type-lead text-ink">
                    {result.message}
                  </p>
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <Link href={sellHref(form)} className="btn-cta">
                      Send the car through
                      <ArrowRight size={18} weight="bold" />
                    </Link>
                    <a href={phone.tel} className="btn-secondary">
                      <Phone size={18} weight="fill" />
                      {phone.display}
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {stale && (
            <p className="mt-3 text-sm text-meta">
              That range belongs to the last car. Press{" "}
              <strong>Price this car instead</strong> for the new one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
