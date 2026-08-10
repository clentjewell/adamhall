import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  estimateValuation,
  measurePaidRatio,
  type Comparable,
  type ValuationInput,
} from "../lib/valuation";

const YEAR = new Date().getFullYear();

const subject = (over: Partial<ValuationInput> = {}): ValuationInput => ({
  make: "Toyota",
  model: "RAV4",
  year: YEAR - 4,
  odometerKm: 50_000,
  condition: "very_good",
  serviceHistory: "full",
  hadAccidents: false,
  ...over,
});

/**
 * A subject whose condition, service history and accident factors are all
 * 1.0, so the anchor comes through unmodified. Used to test anchoring on its
 * own, separately from the adjustments.
 */
const neutralSubject = (over: Partial<ValuationInput> = {}): ValuationInput =>
  subject({
    condition: "very_good",
    serviceHistory: "partial",
    hadAccidents: false,
    ...over,
  });

const comp = (over: Partial<Comparable> = {}): Comparable => ({
  make: "Toyota",
  model: "RAV4",
  year: YEAR - 4,
  odometerKm: 50_000,
  price: 30_000,
  basis: "paid",
  ...over,
});

describe("estimateValuation — guard rails", () => {
  test("declines a year before 1990 rather than extrapolating", () => {
    const r = estimateValuation(subject({ year: 1985 }), [comp()]);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "out_of_range");
  });

  test("declines an implausible odometer", () => {
    const r = estimateValuation(subject({ odometerKm: 900_000 }), [comp()]);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, "out_of_range");
  });

  test("declines rather than guessing when nothing comparable exists", () => {
    const r = estimateValuation(subject(), [
      comp({ make: "Mazda", model: "CX-5" }),
    ]);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.reason, "no_comparables");
      // The seller is told why, and given the real next step.
      assert.match(r.message, /Adam will come back to you/);
    }
  });

  test("declines when the only comparable is outside the year window", () => {
    const r = estimateValuation(subject(), [comp({ year: YEAR - 12 })]);
    assert.equal(r.ok, false);
  });
});

describe("estimateValuation — anchoring", () => {
  test("returns the paid comparable itself for a neutral car matching exactly", () => {
    const r = estimateValuation(neutralSubject(), [comp({ price: 30_000 })]);
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.midpoint, 30_000);
  });

  test("a full service book is worth more than the neutral baseline", () => {
    const neutral = estimateValuation(neutralSubject(), [comp({ price: 30_000 })]);
    const booked = estimateValuation(
      neutralSubject({ serviceHistory: "full" }),
      [comp({ price: 30_000 })],
    );
    assert.ok(neutral.ok && booked.ok);
    if (neutral.ok && booked.ok) {
      assert.ok(booked.midpoint > neutral.midpoint);
    }
  });

  test("brackets the midpoint with low below and high above", () => {
    const r = estimateValuation(subject(), [comp()]);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.ok(r.low < r.midpoint, "low should sit under the midpoint");
      assert.ok(r.high > r.midpoint, "high should sit over the midpoint");
    }
  });

  test("takes the median, so one outlier cannot drag the number", () => {
    const r = estimateValuation(subject(), [
      comp({ price: 29_000 }),
      comp({ price: 30_000 }),
      comp({ price: 31_000 }),
      comp({ price: 200_000 }),
    ]);
    assert.equal(r.ok, true);
    // Median of the four aligned values, not the mean, which would be ~72k.
    if (r.ok) assert.ok(r.midpoint < 40_000, `got ${r.midpoint}`);
  });

  test("discounts a retail comparable to what Adam would pay", () => {
    const retail = estimateValuation(subject(), [
      comp({ price: 30_000, basis: "retail" }),
    ]);
    assert.equal(retail.ok, true);
    if (retail.ok) {
      assert.ok(
        retail.midpoint < 30_000,
        "retail should be marked down to a buy price",
      );
    }
  });
});

describe("estimateValuation — adjustments", () => {
  test("higher odometer than the comparable lowers the number", () => {
    const low = estimateValuation(subject({ odometerKm: 40_000 }), [comp()]);
    const high = estimateValuation(subject({ odometerKm: 160_000 }), [comp()]);
    assert.ok(low.ok && high.ok);
    if (low.ok && high.ok) assert.ok(high.midpoint < low.midpoint);
  });

  test("condition moves the number in the expected direction", () => {
    const excellent = estimateValuation(
      subject({ condition: "excellent" }),
      [comp()],
    );
    const fair = estimateValuation(subject({ condition: "fair" }), [comp()]);
    assert.ok(excellent.ok && fair.ok);
    if (excellent.ok && fair.ok) {
      assert.ok(fair.midpoint < excellent.midpoint);
    }
  });

  test("declared accident damage lowers the number", () => {
    const clean = estimateValuation(subject({ hadAccidents: false }), [comp()]);
    const pranged = estimateValuation(subject({ hadAccidents: true }), [comp()]);
    assert.ok(clean.ok && pranged.ok);
    if (clean.ok && pranged.ok) {
      assert.ok(pranged.midpoint < clean.midpoint);
    }
  });

  test("no service history is worth less than a full book", () => {
    const full = estimateValuation(subject({ serviceHistory: "full" }), [comp()]);
    const none = estimateValuation(subject({ serviceHistory: "none" }), [comp()]);
    assert.ok(full.ok && none.ok);
    if (full.ok && none.ok) assert.ok(none.midpoint < full.midpoint);
  });

  test("an older subject than the comparable is worth less", () => {
    const newer = estimateValuation(subject({ year: YEAR - 2 }), [
      comp({ year: YEAR - 4 }),
    ]);
    const older = estimateValuation(subject({ year: YEAR - 8 }), [
      comp({ year: YEAR - 6 }),
    ]);
    assert.ok(newer.ok && older.ok);
    if (newer.ok && older.ok) assert.ok(older.midpoint < newer.midpoint);
  });
});

describe("estimateValuation — confidence and honesty", () => {
  test("a single comparable is never graded high", () => {
    const r = estimateValuation(subject(), [comp()]);
    assert.equal(r.ok, true);
    if (r.ok) assert.notEqual(r.confidence, "high");
  });

  test("a tight set of five or more grades high with the narrowest band", () => {
    const set = [29_800, 30_000, 30_200, 30_400, 29_600].map((price) =>
      comp({ price }),
    );
    const r = estimateValuation(subject(), set);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.confidence, "high");
      assert.equal(r.comparableCount, 5);
      const width = (r.high - r.low) / r.midpoint;
      assert.ok(width < 0.15, `band should be tight, got ${width}`);
    }
  });

  test("a make-only match is graded low and says so in the basis", () => {
    const r = estimateValuation(subject(), [
      comp({ model: "Kluger" }),
      comp({ model: "Kluger" }),
      comp({ model: "Kluger" }),
      comp({ model: "Kluger" }),
      comp({ model: "Kluger" }),
    ]);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.matchTier, "make");
      assert.equal(r.confidence, "low");
      assert.match(r.basis, /same maker/);
    }
  });

  test("a weaker match quotes a wider range than a strong one", () => {
    const strong = estimateValuation(
      subject(),
      [29_800, 30_000, 30_200, 30_400, 29_600].map((price) => comp({ price })),
    );
    const weak = estimateValuation(subject(), [comp({ model: "Kluger" })]);
    assert.ok(strong.ok && weak.ok);
    if (strong.ok && weak.ok) {
      const strongWidth = (strong.high - strong.low) / strong.midpoint;
      const weakWidth = (weak.high - weak.low) / weak.midpoint;
      assert.ok(weakWidth > strongWidth);
    }
  });

  test("model and make matching ignore case and padding", () => {
    const r = estimateValuation(subject({ make: " toyota ", model: "RAV4" }), [
      comp({ make: "TOYOTA", model: " rav4" }),
    ]);
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.matchTier, "model");
  });
});

describe("measurePaidRatio", () => {
  test("measures the real spread when both sides are present", () => {
    const ratio = measurePaidRatio([
      comp({ price: 24_000, basis: "paid" }),
      comp({ price: 30_000, basis: "retail" }),
    ]);
    assert.equal(ratio, 0.8);
  });

  test("falls back when there is nothing paid to compare", () => {
    const ratio = measurePaidRatio([comp({ price: 30_000, basis: "retail" })]);
    assert.equal(ratio, 0.82);
  });

  test("rejects a nonsense ratio at or above retail", () => {
    const ratio = measurePaidRatio([
      comp({ price: 40_000, basis: "paid" }),
      comp({ price: 30_000, basis: "retail" }),
    ]);
    assert.equal(ratio, 0.82);
  });

  test("rejects an implausibly deep ratio", () => {
    const ratio = measurePaidRatio([
      comp({ price: 6_000, basis: "paid" }),
      comp({ price: 30_000, basis: "retail" }),
    ]);
    assert.equal(ratio, 0.82);
  });
});
