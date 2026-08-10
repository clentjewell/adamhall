// Instant valuation maths for the "what's my car worth" tool.
//
// No I/O here. Comparables are passed in so this stays testable and so the
// source can change without touching the maths: today they come from Adam's
// own book (submissions he has priced, cars he has sold), and a licensed
// market-data provider can be swapped in behind the same shape later.
//
// The honest constraint this module is built around: an estimate is only
// produced when there is something real to anchor it to. When there is not,
// it returns `ok: false` and the caller degrades to "Adam will come back to
// you with a number" rather than inventing one. A used-car brand whose whole
// promise is that nothing is hidden cannot afford a made-up figure.

export type Condition = "excellent" | "very_good" | "good" | "fair";
export type ServiceHistoryValue = "full" | "partial" | "none" | "unknown";

/** Where a comparable's price sits in the deal. */
export type PriceBasis =
  /** Retail asking or sold price of a car on the lot. */
  | "retail"
  /** What Adam actually paid a seller. The target variable. */
  | "paid";

export interface Comparable {
  make: string;
  model: string;
  year: number;
  odometerKm: number;
  price: number;
  basis: PriceBasis;
}

export interface ValuationInput {
  make: string;
  model: string;
  year: number;
  odometerKm: number;
  condition: Condition;
  serviceHistory: ServiceHistoryValue;
  hadAccidents: boolean;
}

/** How closely the comparable set actually matched the subject car. */
export type MatchTier = "model" | "make";

export interface ValuationEstimate {
  ok: true;
  low: number;
  high: number;
  midpoint: number;
  confidence: "low" | "medium" | "high";
  matchTier: MatchTier;
  comparableCount: number;
  /** Plain-English basis, shown to the seller. Never hide the reasoning. */
  basis: string;
}

export interface ValuationUnavailable {
  ok: false;
  reason: "no_comparables" | "out_of_range";
  /** Plain-English explanation, shown to the seller. */
  message: string;
}

export type ValuationResult = ValuationEstimate | ValuationUnavailable;

// --- Assumptions -----------------------------------------------------------
//
// Every constant below is an assumption, not a measured figure. They are
// gathered here, named, and commented so Adam can correct them in one place.
// None of them has been signed off yet — see DD16.

/** Australian average annual travel. ABS puts the car average near 12,100 km. */
const EXPECTED_KM_PER_YEAR = 12_500;

/**
 * Value lost per extra 1,000 km above expectation, as a share of value.
 * Applied symmetrically, so a low-km car is credited on the same curve.
 */
const KM_ADJUST_PER_1000 = 0.0035;

/** Cap the odometer adjustment so an outlier reading cannot dominate. */
const KM_ADJUST_CAP = 0.25;

/** Year-on-year value retention used to age-align a comparable to the subject. */
const ANNUAL_RETENTION = 0.88;

/**
 * Fallback retail-to-paid ratio, used only when there are no `paid`
 * comparables to measure the real spread from. Covers reconditioning,
 * holding cost and margin.
 */
const FALLBACK_PAID_RATIO = 0.82;

const CONDITION_FACTOR: Record<Condition, number> = {
  excellent: 1.06,
  very_good: 1.0,
  good: 0.94,
  fair: 0.84,
};

const SERVICE_FACTOR: Record<ServiceHistoryValue, number> = {
  full: 1.03,
  partial: 1.0,
  unknown: 0.98,
  none: 0.96,
};

/** Repaired accident damage, declared by the seller. */
const ACCIDENT_FACTOR = 0.92;

/** Half-width of the quoted range, by confidence. */
const BAND: Record<ValuationEstimate["confidence"], number> = {
  high: 0.06,
  medium: 0.09,
  low: 0.14,
};

/** Years either side of the subject that a comparable may sit. */
const YEAR_WINDOW = 3;

/** Outside this, the tool declines rather than extrapolating. */
const MIN_YEAR = 1990;
const MAX_ODOMETER_KM = 500_000;

// --- Helpers ---------------------------------------------------------------

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function roundTo100(n: number): number {
  return Math.round(n / 100) * 100;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Measure the retail-to-paid ratio from the comparable set itself, so the
 * spread reflects what Adam actually does rather than the fallback constant.
 * Needs both kinds present to be meaningful.
 */
export function measurePaidRatio(comparables: Comparable[]): number {
  const paid = comparables.filter((c) => c.basis === "paid").map((c) => c.price);
  const retail = comparables
    .filter((c) => c.basis === "retail")
    .map((c) => c.price);

  if (paid.length === 0 || retail.length === 0) return FALLBACK_PAID_RATIO;

  const ratio = median(paid) / median(retail);
  // Refuse a nonsense ratio from a thin or skewed set.
  if (!Number.isFinite(ratio) || ratio <= 0.4 || ratio >= 1) {
    return FALLBACK_PAID_RATIO;
  }
  return ratio;
}

/**
 * Restate one comparable as what the subject car would be worth to Adam:
 * age-align it, correct for odometer difference, then convert retail to paid.
 */
function alignToSubject(
  comparable: Comparable,
  input: ValuationInput,
  paidRatio: number,
): number {
  let value = comparable.price;

  // Age. A comparable one year newer than the subject is worth more, so
  // discount it down to the subject's year.
  const yearGap = input.year - comparable.year;
  value *= Math.pow(ANNUAL_RETENTION, -yearGap);

  // Odometer, measured against what each car should have travelled by now
  // rather than against each other, so age and mileage stay separable.
  const subjectAge = Math.max(0, new Date().getFullYear() - input.year);
  const comparableAge = Math.max(0, new Date().getFullYear() - comparable.year);
  const subjectExcess = input.odometerKm - subjectAge * EXPECTED_KM_PER_YEAR;
  const comparableExcess =
    comparable.odometerKm - comparableAge * EXPECTED_KM_PER_YEAR;
  const excessDelta = subjectExcess - comparableExcess;
  const kmAdjust = clamp(
    (-excessDelta / 1000) * KM_ADJUST_PER_1000,
    -KM_ADJUST_CAP,
    KM_ADJUST_CAP,
  );
  value *= 1 + kmAdjust;

  // Retail comparables describe the sell side of the deal, not the buy side.
  if (comparable.basis === "retail") value *= paidRatio;

  return value;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function selectComparables(
  comparables: Comparable[],
  input: ValuationInput,
): { set: Comparable[]; tier: MatchTier } | null {
  const make = norm(input.make);
  const model = norm(input.model);
  const inWindow = (c: Comparable) =>
    Math.abs(c.year - input.year) <= YEAR_WINDOW;

  const byModel = comparables.filter(
    (c) => norm(c.make) === make && norm(c.model) === model && inWindow(c),
  );
  if (byModel.length > 0) return { set: byModel, tier: "model" };

  // Same marque, different model. Weak, and labelled as such.
  const byMake = comparables.filter(
    (c) => norm(c.make) === make && inWindow(c),
  );
  if (byMake.length > 0) return { set: byMake, tier: "make" };

  return null;
}

function gradeConfidence(
  count: number,
  tier: MatchTier,
  spread: number,
): ValuationEstimate["confidence"] {
  if (tier === "make") return "low";
  if (count >= 5 && spread < 0.2) return "high";
  if (count >= 2) return "medium";
  return "low";
}

function describeBasis(
  count: number,
  tier: MatchTier,
  input: ValuationInput,
): string {
  const cars = count === 1 ? "one car" : `${count} cars`;
  if (tier === "model") {
    return `We lined your car up against ${cars} like it through Adam's books, then corrected for your year and odometer.`;
  }
  return `We have not had a ${input.make} ${input.model} through recently, so we worked from ${cars} by the same maker. Treat it as a wide guide.`;
}

// --- Entry point -----------------------------------------------------------

export function estimateValuation(
  input: ValuationInput,
  comparables: Comparable[],
): ValuationResult {
  const currentYear = new Date().getFullYear();

  if (
    input.year < MIN_YEAR ||
    input.year > currentYear + 1 ||
    input.odometerKm < 0 ||
    input.odometerKm > MAX_ODOMETER_KM
  ) {
    return {
      ok: false,
      reason: "out_of_range",
      message:
        "Those details are outside what we can estimate on. Send the car through and Adam will look at it himself.",
    };
  }

  const selected = selectComparables(comparables, input);
  if (!selected) {
    return {
      ok: false,
      reason: "no_comparables",
      message:
        "We have not had one of these through recently, so an instant number would be a guess. Send it through and Adam will come back to you with a real one.",
    };
  }

  const paidRatio = measurePaidRatio(comparables);
  const aligned = selected.set
    .map((c) => alignToSubject(c, input, paidRatio))
    .filter((v) => Number.isFinite(v) && v > 0);

  if (aligned.length === 0) {
    return {
      ok: false,
      reason: "no_comparables",
      message:
        "We could not line your car up against anything we have bought recently. Send it through for a real number.",
    };
  }

  const anchor = median(aligned);

  // Condition is the seller's own assessment, so it moves the number but is
  // never the whole story. Inspection settles it.
  const adjusted =
    anchor *
    CONDITION_FACTOR[input.condition] *
    SERVICE_FACTOR[input.serviceHistory] *
    (input.hadAccidents ? ACCIDENT_FACTOR : 1);

  const spread =
    aligned.length > 1
      ? (Math.max(...aligned) - Math.min(...aligned)) / anchor
      : 1;
  const confidence = gradeConfidence(aligned.length, selected.tier, spread);
  const band = BAND[confidence];

  return {
    ok: true,
    low: roundTo100(adjusted * (1 - band)),
    high: roundTo100(adjusted * (1 + band)),
    midpoint: roundTo100(adjusted),
    confidence,
    matchTier: selected.tier,
    comparableCount: aligned.length,
    basis: describeBasis(aligned.length, selected.tier, input),
  };
}
