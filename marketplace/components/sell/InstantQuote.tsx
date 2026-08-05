"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Phone } from "@phosphor-icons/react";
import { getInstantQuote, type QuotePayload } from "@/app/actions/quote";
import type { ValuationResult } from "@/lib/valuation";
import { formatPrice } from "@/lib/format";

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
  const reduce = useReducedMotion();

  const set = (patch: Partial<Form>) => {
    setError(null);
    setForm((f) => ({ ...f, ...patch }));
  };

  async function onSubmit(e: React.FormEvent) {
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

    setPending(true);
    setResult(null);
    const res = await getInstantQuote({
      make: form.make,
      model: form.model,
      year: Number(form.year),
      odometer_km: Number(form.odometer_km),
      condition: form.condition,
      service_history: form.service_history,
      had_accidents: form.had_accidents === "yes",
      suburb: form.suburb || undefined,
    });
    setPending(false);

    if (!res.ok || !res.result) {
      setError(res.error ?? "Something went wrong. Please try again.");
      return;
    }
    setResult(res.result);
  }

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
            </div>
          </div>

          <div className="mt-6">
            <span className="label">Condition</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {CONDITIONS.map((c) => (
                <label
                  key={c.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    form.condition === c.value
                      ? "border-forest-600 bg-forest-50"
                      : "border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    className="mt-1 accent-forest-600"
                    checked={form.condition === c.value}
                    onChange={() => set({ condition: c.value })}
                  />
                  <span>
                    <span className="block font-semibold">{c.label}</span>
                    <span className="block text-sm text-meta">{c.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="q-service">
                Service history
              </label>
              <select
                id="q-service"
                className="input"
                value={form.service_history}
                onChange={(e) =>
                  set({
                    service_history: e.target
                      .value as QuotePayload["service_history"],
                  })
                }
              >
                {SERVICE.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
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

          <div className="mt-6">
            <span className="label">Has it been in an accident?</span>
            <div className="flex gap-2">
              {(["no", "yes"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set({ had_accidents: v })}
                  aria-pressed={form.had_accidents === v}
                  className={`rounded-full border px-5 py-2 font-semibold transition-colors ${
                    form.had_accidents === v
                      ? "border-forest-600 bg-forest-600 text-white"
                      : "border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {v === "no" ? "No" : "Yes"}
                </button>
              ))}
            </div>
            <p className="helper">
              Repaired damage is fine, and telling us now saves a surprise later.
            </p>
          </div>

          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-cta mt-6 w-full sm:w-auto">
            {pending ? "Working it out" : "See what it is worth"}
            {!pending && <ArrowRight size={18} weight="bold" />}
          </button>
        </fieldset>
      </form>

      {/* ---- The number --------------------------------------------- */}
      <div className="lg:pl-2">
        {!result && !pending && (
          <div className="card h-full p-6">
            <p className="text-[21px] leading-[1.55] font-light text-meta">
              Fill in the car on the left and we will show you the range it sits
              in, straight away. No account, no contact details, just the range.
            </p>
            <p className="mt-4 text-sm text-meta">
              We work from cars Adam has bought and sold himself. If we have not
              seen one like yours recently, we say so instead of guessing.
            </p>
          </div>
        )}

        {pending && (
          <div className="card h-full space-y-3 p-6" aria-live="polite">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        )}

        {result && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            // Entrance token from the identity: 320ms, arrives fast, settles.
            transition={{ duration: 0.32, ease: [0, 0, 0.2, 1] }}
            className="card overflow-hidden"
            aria-live="polite"
          >
            {result.ok ? (
              <>
                <div className="bg-forest-600 px-6 py-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
                    Indicative range
                  </p>
                  <p className="tabular mt-1 text-3xl font-extrabold sm:text-4xl">
                    {formatPrice(result.low)} to {formatPrice(result.high)}
                  </p>
                </div>
                <div className="space-y-4 p-6">
                  <p className="text-ink">{result.basis}</p>

                  {result.confidence === "low" && (
                    <p className="rounded-lg bg-forest-50 p-3 text-sm text-ink">
                      Treat this one as a wide guide. Adam will tighten it once he
                      has seen the car.
                    </p>
                  )}

                  <p className="text-sm text-meta">
                    This is an estimate, not an offer. The real number comes after
                    Adam looks the car over, and it can move either way. Nothing
                    here commits you or him to anything.
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
                    The full form takes about five minutes. Adam looks over every
                    car himself.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-meta">
                  No instant number for this one
                </p>
                <p className="text-[21px] leading-[1.55] font-light text-ink">{result.message}</p>
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
      </div>
    </div>
  );
}
