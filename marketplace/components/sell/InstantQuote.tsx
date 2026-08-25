"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  Lock,
  Phone,
  ShieldCheck,
  Tag,
  TrendDown,
  TrendUp,
} from "@phosphor-icons/react";
import { getInstantQuote, type QuotePayload } from "@/app/actions/quote";
import ValuationSteps from "@/components/sell/ValuationSteps";
import type { ValuationResult } from "@/lib/valuation";
import { formatKm, formatPrice } from "@/lib/format";
import {
  DUR,
  EASE_ENTRANCE,
  EASE_EXIT,
  EASE_STANDARD,
} from "@/components/motion/Reveal";

/** Worst to best, because the slider reads left to right. The four steps are
    the four the estimate actually accepts — the control is a different shape
    from the old radio cards, not a different question. */
const CONDITIONS: { value: QuotePayload["condition"]; label: string; hint: string }[] =
  [
    { value: "fair", label: "Fair", hint: "Needs a bit of work" },
    { value: "good", label: "Good", hint: "Honest car, some wear" },
    { value: "very_good", label: "Very good", hint: "Tidy, a couple of small marks" },
    { value: "excellent", label: "Excellent", hint: "Looks near new, no marks" },
  ];

/** Where the thumb rests before anyone has touched it. Middle of the scale so
    the control does not suggest an answer: parked at one end it would read as
    a claim about the car nobody has made yet. */
const CONDITION_START = 1;

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
  condition: "" | QuotePayload["condition"];
  service_history: "" | QuotePayload["service_history"];
  had_accidents: "" | "yes" | "no";
  suburb: string;
}

const emptyForm: Form = {
  make: "",
  model: "",
  year: "",
  odometer_km: "",
  // No pre-selected answers. They used to default to "very good" and "full
  // book", which both flattered the car and meant the groups below could
  // never be gated on a real answer. An unanswered question also reads as a
  // question; a pre-answered one reads as a form already filled in.
  condition: "",
  service_history: "",
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
      // Both are gated in the UI, and validated below, so by the time a
      // request goes out they are answered.
      condition: f.condition || "very_good",
      service_history: f.service_history || "unknown",
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
    if (!form.condition) {
      setError("How is the car looking?");
      return;
    }
    if (!form.service_history) {
      setError("What service history does it have?");
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

  // The condition slider. `conditionStep` is null until the seller has moved
  // it, which is what lets the label read "Not set" while the thumb still has
  // somewhere to sit.
  const conditionStep =
    CONDITIONS.find((c) => c.value === form.condition) ?? null;
  const conditionIndex = conditionStep
    ? CONDITIONS.indexOf(conditionStep)
    : CONDITION_START;

  // Standard token for state changes between two on-screen states
  // (identity section 13). Instant under reduced motion.
  const t = reduce
    ? { duration: 0 }
    : { duration: DUR.standard, ease: EASE_STANDARD };

  // Progressive disclosure. The form used to lay every field out at once,
  // which reads as a long form to fill in rather than a few quick
  // questions. Each group appears when the one before it has an answer, so
  // the visitor only ever sees what they are being asked now.
  //
  // Gated on real answers rather than a step counter, so the live
  // re-estimation still works and nothing is trapped behind a Next button:
  // going back and changing the year keeps everything below it on screen.
  const carAnswered = Boolean(
    form.make.trim() &&
      form.model.trim() &&
      form.year.length === 4 &&
      form.odometer_km,
  );
  const conditionAnswered = carAnswered && Boolean(form.condition);
  const serviceAnswered = conditionAnswered && Boolean(form.service_history);

  return (
    <>
      {/* The tool's own progress. Step three marks itself once a range
          exists, so this tracks the state rather than decorating it. */}
      <ValuationSteps current={result ? 3 : 2} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-8">
      {/* ---- The car ------------------------------------------------- */}
      {/* In a card, like the panel beside it. Bare on the page background the
          form read as unfinished next to a bordered panel, and the two halves
          of one tool looked like two different things. */}
      <form onSubmit={onSubmit} noValidate className="card p-6 sm:p-8">
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
            </div>
          </div>

          {/* Condition as one slider rather than four cards. Four cards each
              carrying a heading and a hint took more vertical room than the
              rest of the car put together, for a question with one axis.
              The scale is the same four steps; only the control changed.

              It starts uncommitted. The thumb has to sit somewhere, so it
              sits mid-scale, but nothing is selected until the seller moves
              it — a control that arrives pre-answered is a form filling
              itself in, and on the honest end of a valuation that matters. */}
          <div className="mt-6">
            <div className="flex items-baseline justify-between gap-3">
              <label className="label !mb-0" htmlFor="q-condition">
                Condition
              </label>
              <span
                className={`text-sm font-semibold ${
                  form.condition ? "text-forest-700" : "text-meta"
                }`}
                aria-hidden="true"
              >
                {conditionStep ? conditionStep.label : "Not set"}
              </span>
            </div>
            <input
              id="q-condition"
              type="range"
              min={0}
              max={CONDITIONS.length - 1}
              step={1}
              value={conditionIndex}
              onChange={(e) =>
                set({ condition: CONDITIONS[Number(e.target.value)].value })
              }
              // Grey until it has been set. The browser fills the track up to
              // the thumb whatever we do, and in green that filled bar reads
              // as an answer while the label still says "Not set".
              className={`mt-3 w-full ${
                form.condition ? "accent-forest-600" : "accent-stone-400"
              }`}
              aria-valuetext={conditionStep ? conditionStep.label : "Not set"}
            />
            <div className="mt-1 flex justify-between type-caption text-meta">
              <span>{CONDITIONS[0].label}</span>
              <span>{CONDITIONS[CONDITIONS.length - 1].label}</span>
            </div>
            <p className="helper">
              {conditionStep ? conditionStep.hint : "Slide to set how it is looking."}
            </p>
          </div>

          <div className="mt-6" hidden={!conditionAnswered}>
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2" hidden={!serviceAnswered}>
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
            {/* Belongs to the accident question, so it appears with it. Sitting
                outside the group it stayed on screen on its own, explaining an
                answer to a question that had not been asked yet. */}
            <p className="helper sm:col-span-2 !mt-0">
              Repaired damage is fine, and telling us now saves a surprise later.
            </p>
          </div>

          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}

          {/* The button is on screen from the start rather than appearing at
              the end. It is the goal, not a field, and a form whose finish
              line is hidden reads as one with no end to it. Submitting early
              names the next unanswered question, and that question is always
              one that is already visible. */}
          <div className="mt-7">
            <button type="submit" className="btn-primary w-full">
              {pending
                ? "Working it out"
                : stale
                  ? "Price this car instead"
                  : "Show my range"}
              {!pending && <ArrowRight size={18} weight="bold" />}
            </button>
            {/* What this promise can honestly say. Every quote is logged to
                quote_requests — the car, not the person — so "we don't save
                your details" would be untrue. No contact details are asked
                for, and that is the part worth promising. */}
            <p className="helper mt-3 flex items-center justify-center gap-1.5">
              <Lock size={13} weight="fill" aria-hidden="true" />
              No account, no contact details. Just the number.
            </p>
          </div>
        </fieldset>
      </form>

      {/* ---- The number --------------------------------------------- */}
      <div className="lg:pl-2">
        <div className="lg:sticky lg:top-24">
          {/* Before there is a number, the panel says how the number gets
              made. Three claims, each one true of what the estimator actually
              does: it reads our own book, corrects for the car, and answers
              on this page. */}
          {!result && !pending && (
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-600 text-white"
                  aria-hidden="true"
                >
                  <Tag size={20} weight="fill" />
                </span>
                <h2 className="type-card-title">Here&apos;s what happens next</h2>
              </div>

              <ul className="mt-5 space-y-3.5">
                {[
                  "We start with cars we have bought and sold ourselves.",
                  "We correct for your year, kilometres and condition.",
                  "Your range appears here, straight away.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forest-50 text-forest-700"
                      aria-hidden="true"
                    >
                      <Check size={12} weight="bold" />
                    </span>
                    <span className="text-stone-600">{line}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-start gap-3 border-t border-hairline pt-6">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand text-ink"
                  aria-hidden="true"
                >
                  <ShieldCheck size={17} weight="fill" />
                </span>
                <p className="type-caption text-meta">
                  We never ask for your name or your number to show you this.
                  We keep a note of the car so we know what people are
                  asking about, and that is all.
                </p>
              </div>
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

                    {/* The odometer, moved here from the entry form. As a
                        field among fields it was one more thing to fill in;
                        beside the number it moves, it is the reason to stay
                        on the page. The range follows as it slides. */}
                    <div className="rounded-lg bg-forest-50 p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <label className="label !mb-0" htmlFor="q-km-slider">
                          Wind the kilometres
                        </label>
                        <span className="tabular text-sm font-semibold text-forest-700">
                          {formatKm(Number(form.odometer_km) || 0)}
                        </span>
                      </div>
                      <input
                        id="q-km-slider"
                        type="range"
                        className="mt-2.5 w-full accent-forest-600"
                        min={0}
                        max={SLIDER_MAX_KM}
                        step={1000}
                        value={sliderKm}
                        onChange={(e) => set({ odometer_km: e.target.value })}
                      />
                      <p className="type-caption mt-1 text-meta">
                        Move it, or change the condition, and the range answers
                        as you go.
                      </p>
                    </div>

                    {result.confidence === "low" && (
                      <p className="text-sm text-ink">
                        Treat this one as a wide guide. We will tighten it once
                        we have seen the car.
                      </p>
                    )}

                    <p className="text-sm text-meta">
                      This is an estimate, not an offer. The real number comes
                      after we look the car over, and it can move either way.
                      Nothing here commits you or us to anything.
                    </p>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                      <Link href={sellHref(form)} className="btn-cta">
                        Get our real offer
                        <ArrowRight size={18} weight="bold" />
                      </Link>
                      <a href={phone.tel} className="btn-secondary">
                        <Phone size={18} weight="fill" />
                        {phone.display}
                      </a>
                    </div>
                    <p className="text-sm text-meta">
                      The full form takes about five minutes. We look over
                      every car ourselves.
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
    </>
  );
}
