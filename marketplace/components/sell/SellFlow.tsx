"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  X,
} from "@phosphor-icons/react";
import { compressImage, uploadSubmissionPhoto } from "@/lib/upload";
import { createSubmission, type SellPayload } from "@/app/actions/sell";

const DRAFT_KEY = "ah-sell-draft-v1";
const STATES = ["NSW", "QLD", "VIC", "SA", "WA", "TAS", "NT", "ACT"];
const STEPS = ["Your car", "Condition", "Photos", "You"] as const;

interface PhotoItem {
  path: string;
  preview: string;
}

interface Draft {
  rego: string;
  rego_state: string;
  manual: boolean;
  make: string;
  model: string;
  year: string;
  odometer_km: string;
  service_history: string;
  had_accidents: "" | "yes" | "no";
  accident_notes: string;
  tyres_condition: string;
  interior_condition: string;
  mechanical_issues: string;
  condition_notes: string;
  seller_name: string;
  phone: string;
  email: string;
  suburb: string;
  asking_price: string;
  sell_timeframe: string;
  draftId: string;
  photos: PhotoItem[];
}

const emptyDraft = (): Draft => ({
  rego: "",
  rego_state: "NSW",
  manual: false,
  make: "",
  model: "",
  year: "",
  odometer_km: "",
  service_history: "",
  had_accidents: "",
  accident_notes: "",
  tyres_condition: "",
  interior_condition: "",
  mechanical_issues: "",
  condition_notes: "",
  seller_name: "",
  phone: "",
  email: "",
  suburb: "",
  asking_price: "",
  sell_timeframe: "",
  draftId: crypto.randomUUID(),
  photos: [],
});

const SHOT_LIST = [
  "Front three-quarter (whole car, front + side)",
  "Rear three-quarter",
  "Interior, front seats",
  "Dash with the odometer showing",
  "Any damage, up close (be straight with us)",
];

export default function SellFlow({
  tradeTarget,
}: {
  tradeTarget: { id: string; title: string } | null;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [doneToken, setDoneToken] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  // Save-and-resume: the draft lives in localStorage until submitted.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Draft;
        // Object previews don't survive reload; keep paths only.
        saved.photos = (saved.photos ?? []).map((p) => ({ ...p, preview: "" }));
        setDraft({ ...emptyDraft(), ...saved });
        if (saved.rego || saved.make || saved.seller_name) setRestored(true);
      }
    } catch {
      /* fresh start */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* storage full or blocked — flow still works, just no resume */
    }
  }, [draft]);

  const set = (patch: Partial<Draft>) => {
    setError(null);
    setDraft((d) => ({ ...d, ...patch }));
  };

  function validateStep(): string | null {
    if (step === 0) {
      if (!draft.manual && draft.rego.trim().length < 3)
        return "Pop your rego in, or switch to entering the car manually.";
      if (draft.manual && !(draft.make.trim() && draft.model.trim() && draft.year))
        return "We need make, model and year.";
      if (!draft.odometer_km || Number(draft.odometer_km) <= 0)
        return "Roughly how many kays has it done?";
    }
    if (step === 1) {
      if (!draft.service_history) return "Pick the closest match for service history.";
      if (!draft.had_accidents) return "Has it been in an accident? Yes or no is fine.";
    }
    if (step === 2) {
      if (draft.photos.length < 4)
        return "Four photos minimum — front, rear, interior and dash. More is better.";
    }
    if (step === 3) {
      if (draft.seller_name.trim().length < 2) return "We need your name.";
      if (draft.phone.trim().length < 8) return "We need a phone number to give you the offer.";
      if (!/.+@.+\..+/.test(draft.email)) return "That email doesn't look right.";
    }
    return null;
  }

  function next() {
    const problem = validateStep();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0 });
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const room = 12 - draft.photos.length;
    const list = Array.from(files).slice(0, room);
    if (list.length === 0) {
      setError("That's the lot — 12 photos is plenty.");
      return;
    }
    setUploading((n) => n + list.length);
    for (const [i, file] of list.entries()) {
      try {
        const blob = await compressImage(file);
        const path = await uploadSubmissionPhoto(blob, draft.draftId, draft.photos.length + i);
        const preview = URL.createObjectURL(blob);
        setDraft((d) => ({ ...d, photos: [...d.photos, { path, preview }] }));
      } catch (e) {
        console.error(e);
        setError("One photo didn't upload. Give it another go.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  async function submit() {
    const problem = validateStep();
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload: SellPayload = {
      rego: draft.rego.trim() || undefined,
      rego_state: draft.rego.trim() ? draft.rego_state : undefined,
      make: draft.make.trim() || undefined,
      model: draft.model.trim() || undefined,
      year: draft.year ? Number(draft.year) : undefined,
      odometer_km: Number(draft.odometer_km),
      service_history: (draft.service_history || "unknown") as SellPayload["service_history"],
      had_accidents: draft.had_accidents === "yes",
      accident_notes: draft.accident_notes.trim() || undefined,
      tyres_condition: draft.tyres_condition || undefined,
      interior_condition: draft.interior_condition.trim() || undefined,
      mechanical_issues: draft.mechanical_issues.trim() || undefined,
      condition_notes: draft.condition_notes.trim() || undefined,
      seller_name: draft.seller_name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      suburb: draft.suburb.trim() || undefined,
      asking_price: draft.asking_price ? Number(draft.asking_price) : undefined,
      sell_timeframe: draft.sell_timeframe || undefined,
      trade_target_car_id: tradeTarget?.id,
      photo_paths: draft.photos.map((p, i) => ({
        path: p.path,
        kind: i === 0 ? "hero" : undefined,
      })),
    };
    const result = await createSubmission(payload);
    setSubmitting(false);
    if (!result.ok || !result.token) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
    setDoneToken(result.token);
    window.scrollTo({ top: 0 });
  }

  if (doneToken) {
    return (
      <div className="card p-8 text-center max-w-xl mx-auto" role="status">
        <CheckCircle size={56} weight="fill" className="text-forest-600 mx-auto" />
        <h2 className="font-display font-extrabold text-2xl mt-4">
          Done. Adam has your car.
        </h2>
        <p className="text-stone-600 mt-3 leading-relaxed">
          He personally reviews every car that comes through here — you&apos;ll
          hear back within 1 business day, usually much sooner. We&apos;ve
          emailed you a link, or watch it move here:
        </p>
        <Link href={`/sell/status/${doneToken}`} className="btn-primary mt-6">
          Track your submission
        </Link>
      </div>
    );
  }

  const radioCard = (
    name: string,
    value: string,
    current: string,
    label: string,
    onPick: () => void,
  ) => (
    <button
      type="button"
      role="radio"
      aria-checked={current === value}
      onClick={onPick}
      className={`px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-colors ${
        current === value
          ? "border-forest-600 bg-forest-50 text-forest-700"
          : "border-stone-200 text-stone-600 hover:border-forest-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-xl mx-auto">
      {tradeTarget && (
        <div className="card p-4 mb-6 !bg-amber-soft !border-amber-accent/30 text-sm">
          <p className="font-bold">Trading against the {tradeTarget.title}</p>
          <p className="text-stone-600 mt-0.5">
            Adam will price your car and the changeover together, so you see
            one clean number.
          </p>
        </div>
      )}

      {restored && step === 0 && (
        <div className="card p-4 mb-6 text-sm flex items-center justify-between gap-3">
          <p className="text-stone-600">
            Picked up where you left off — your earlier answers are saved.
          </p>
          <button
            className="btn-ghost text-sm !py-1.5 shrink-0"
            onClick={() => {
              localStorage.removeItem(DRAFT_KEY);
              setDraft(emptyDraft());
              setRestored(false);
            }}
          >
            Start fresh
          </button>
        </div>
      )}

      {/* Progress */}
      <ol className="flex items-center gap-2 mb-8" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${i <= step ? "bg-forest-600" : "bg-stone-200"}`}
            />
            <p
              className={`mt-1.5 text-xs font-semibold ${i === step ? "text-forest-700" : "text-stone-400"}`}
            >
              {s}
            </p>
          </li>
        ))}
      </ol>

      {/* Step change slides forward slightly — orientation, not spectacle */}
      <motion.div
        key={step}
        initial={reduce ? false : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
      {step === 0 && (
        <section className="space-y-5">
          <h2 className="font-display font-bold text-2xl">
            Let&apos;s start with the car
          </h2>
          {!draft.manual ? (
            <>
              <div className="grid grid-cols-[1fr_110px] gap-3">
                <div>
                  <label htmlFor="rego" className="label">Rego plate</label>
                  <input
                    id="rego"
                    className="input uppercase tracking-widest font-bold"
                    value={draft.rego}
                    onChange={(e) => set({ rego: e.target.value.toUpperCase() })}
                    placeholder="ABC12D"
                    maxLength={8}
                  />
                </div>
                <div>
                  <label htmlFor="rego-state" className="label">State</label>
                  <select
                    id="rego-state"
                    className="input"
                    value={draft.rego_state}
                    onChange={(e) => set({ rego_state: e.target.value })}
                  >
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-forest-700 underline underline-offset-2"
                onClick={() => set({ manual: true })}
              >
                No rego handy? Enter the car manually
              </button>
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="make" className="label">Make</label>
                  <input id="make" className="input" value={draft.make} onChange={(e) => set({ make: e.target.value })} placeholder="Toyota" />
                </div>
                <div>
                  <label htmlFor="model" className="label">Model</label>
                  <input id="model" className="input" value={draft.model} onChange={(e) => set({ model: e.target.value })} placeholder="Hilux" />
                </div>
                <div>
                  <label htmlFor="year" className="label">Year</label>
                  <input id="year" type="number" className="input" value={draft.year} onChange={(e) => set({ year: e.target.value })} placeholder="2019" min={1980} max={new Date().getFullYear() + 1} />
                </div>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-forest-700 underline underline-offset-2"
                onClick={() => set({ manual: false })}
              >
                Actually, I&apos;ll use the rego
              </button>
            </>
          )}
          <div>
            <label htmlFor="odo" className="label">Odometer (km)</label>
            <input
              id="odo"
              type="number"
              inputMode="numeric"
              className="input"
              value={draft.odometer_km}
              onChange={(e) => set({ odometer_km: e.target.value })}
              placeholder="89000"
            />
            <p className="helper">Near enough is fine — we&apos;ll confirm at inspection.</p>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-6">
          <div>
            <h2 className="font-display font-bold text-2xl">How&apos;s it holding up?</h2>
            <p className="text-stone-600 mt-1">
              Be straight with us and we&apos;ll be straight with you. Honest
              answers get honest offers — nobody&apos;s marking you down for a
              worn tyre.
            </p>
          </div>
          <div>
            <p className="label">Service history</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Service history">
              {radioCard("sh", "full", draft.service_history, "Full books", () => set({ service_history: "full" }))}
              {radioCard("sh", "partial", draft.service_history, "Some receipts", () => set({ service_history: "partial" }))}
              {radioCard("sh", "none", draft.service_history, "No records", () => set({ service_history: "none" }))}
            </div>
          </div>
          <div>
            <p className="label">Ever been in an accident?</p>
            <div className="flex gap-2" role="radiogroup" aria-label="Accident history">
              {radioCard("acc", "no", draft.had_accidents, "No", () => set({ had_accidents: "no" }))}
              {radioCard("acc", "yes", draft.had_accidents, "Yes", () => set({ had_accidents: "yes" }))}
            </div>
            {draft.had_accidents === "yes" && (
              <div className="mt-3">
                <label htmlFor="acc-notes" className="label">What happened?</label>
                <textarea
                  id="acc-notes"
                  rows={2}
                  className="input resize-none"
                  value={draft.accident_notes}
                  onChange={(e) => set({ accident_notes: e.target.value })}
                  placeholder="Rear-ended at lights in 2021, repaired and painted…"
                />
              </div>
            )}
          </div>
          <div>
            <p className="label">Tyres</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tyre condition">
              {["Near new", "Good", "Fair", "Need replacing"].map((t) =>
                radioCard("tyres", t, draft.tyres_condition, t, () => set({ tyres_condition: t })),
              )}
            </div>
          </div>
          <div>
            <label htmlFor="interior" className="label">
              Interior <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="interior"
              className="input"
              value={draft.interior_condition}
              onChange={(e) => set({ interior_condition: e.target.value })}
              placeholder="Tidy, one mark on the back seat…"
            />
          </div>
          <div>
            <label htmlFor="mech" className="label">
              Anything mechanical we should know? <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="mech"
              className="input"
              value={draft.mechanical_issues}
              onChange={(e) => set({ mechanical_issues: e.target.value })}
              placeholder="Aircon a bit weak, slow leak in one tyre…"
            />
          </div>
          <div>
            <label htmlFor="cond-notes" className="label">
              Anything else? <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <textarea
              id="cond-notes"
              rows={2}
              className="input resize-none"
              value={draft.condition_notes}
              onChange={(e) => set({ condition_notes: e.target.value })}
              placeholder="Garaged, one owner, towbar fitted…"
            />
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-5">
          <div>
            <h2 className="font-display font-bold text-2xl">Show us the car</h2>
            <p className="text-stone-600 mt-1">
              Four to twelve photos, phone camera is perfect. This shot list is
              what Adam looks at first:
            </p>
          </div>
          <ul className="card p-4 space-y-2">
            {SHOT_LIST.map((s, i) => (
              <li key={s} className="flex gap-2.5 text-sm">
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                    i < draft.photos.length
                      ? "bg-forest-600 text-white"
                      : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading > 0 || draft.photos.length >= 12}
            className="btn-secondary w-full !py-4"
          >
            <Camera size={20} weight="bold" />
            {uploading > 0
              ? `Uploading ${uploading}…`
              : draft.photos.length === 0
                ? "Add photos or take them now"
                : `Add more (${draft.photos.length}/12)`}
          </button>

          {draft.photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {draft.photos.map((p, i) => (
                <div key={p.path} className="relative aspect-square rounded-lg overflow-hidden bg-stone-200">
                  {p.preview ? (
                    // Local blob preview — plain <img> is correct here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.preview} alt={`Your photo ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-500">
                      Photo {i + 1} ✓
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove photo ${i + 1}`}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        photos: d.photos.filter((x) => x.path !== p.path),
                      }))
                    }
                    className="absolute top-1 right-1 bg-ink/70 text-white rounded-full p-1"
                  >
                    <X size={12} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {step === 3 && (
        <section className="space-y-5">
          <div>
            <h2 className="font-display font-bold text-2xl">Where do we send the offer?</h2>
            <p className="text-stone-600 mt-1">
              Adam calls with the number, then confirms it in writing. No
              lowball-by-text here.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="label">Name</label>
              <input id="name" className="input" autoComplete="name" value={draft.seller_name} onChange={(e) => set({ seller_name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="phone" className="label">Phone</label>
              <input id="phone" type="tel" className="input" autoComplete="tel" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} />
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" className="input" autoComplete="email" value={draft.email} onChange={(e) => set({ email: e.target.value })} />
            </div>
            <div>
              <label htmlFor="suburb" className="label">Suburb</label>
              <input id="suburb" className="input" value={draft.suburb} onChange={(e) => set({ suburb: e.target.value })} placeholder="Tweed Heads" />
            </div>
          </div>
          <div>
            <label htmlFor="ask" className="label">
              Got a number in mind? <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="ask"
              type="number"
              inputMode="numeric"
              className="input"
              value={draft.asking_price}
              onChange={(e) => set({ asking_price: e.target.value })}
              placeholder="25000"
            />
            <p className="helper">
              Doesn&apos;t lock anything in — it just tells us where your
              head&apos;s at.
            </p>
          </div>
          <div>
            <p className="label">How soon do you want it gone?</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Timeframe">
              {["This week", "Within 2 weeks", "Within a month", "No rush"].map((t) =>
                radioCard("tf", t, draft.sell_timeframe, t, () => set({ sell_timeframe: t })),
              )}
            </div>
          </div>
        </section>
      )}

      </motion.div>

      {error && (
        <p className="error-text mt-5" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" className="btn-ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft size={16} weight="bold" />
            Back
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn-primary" onClick={next} disabled={uploading > 0}>
            Keep going
            <ArrowRight size={16} weight="bold" />
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={submit} disabled={submitting}>
            {submitting ? "Sending to Adam…" : "Send it to Adam"}
          </button>
        )}
      </div>
    </div>
  );
}
