import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateRepayment, estimateWeekly, type RepaymentInput } from "../lib/finance";

function baseInput(overrides: Partial<RepaymentInput> = {}): RepaymentInput {
  return {
    price: 30000,
    deposit: 0,
    tradeIn: 0,
    termMonths: 60,
    annualRatePct: 0,
    balloonPct: 0,
    frequency: "monthly",
    ...overrides,
  };
}

describe("calculateRepayment", () => {
  test("monthly, 0% interest: payment * periods reconstructs the amount financed", () => {
    const result = calculateRepayment(baseInput());
    assert.equal(result.periods, 60);
    assert.equal(result.amountFinanced, 30000);
    assert.equal(result.totalInterest, 0);
    assert.equal(result.paymentPerPeriod, 500);
    assert.ok(
      Math.abs(result.paymentPerPeriod * result.periods - result.amountFinanced) < 1,
      "0% interest: total repaid should equal amount financed",
    );
  });

  test("weekly, 0% interest: total repaid still reconstructs the amount financed", () => {
    const result = calculateRepayment(baseInput({ frequency: "weekly" }));
    // 60 months -> round((60/12) * 52) = 260 weekly periods
    assert.equal(result.periods, 260);
    assert.equal(result.totalInterest, 0);
    // Cent-level rounding of paymentPerPeriod accumulates over many
    // periods, so allow a proportionally larger (but still small) tolerance.
    assert.ok(
      Math.abs(result.paymentPerPeriod * result.periods - result.amountFinanced) <
        result.periods * 0.01,
      "0% interest: total repaid should equal amount financed",
    );
  });

  test("fortnightly frequency uses 26 periods per year", () => {
    const result = calculateRepayment(baseInput({ frequency: "fortnightly" }));
    assert.equal(result.periods, 130); // (60/12) * 26
  });

  test("deposit and trade-in reduce the amount financed", () => {
    const result = calculateRepayment(
      baseInput({ deposit: 3000, tradeIn: 5000 }),
    );
    assert.equal(result.amountFinanced, 22000);
    assert.ok(Math.abs(result.paymentPerPeriod - 22000 / 60) < 0.01);
  });

  test("weekly payments are smaller per-period than monthly for the same loan", () => {
    const monthly = calculateRepayment(baseInput({ annualRatePct: 7.9 }));
    const weekly = calculateRepayment(baseInput({ annualRatePct: 7.9, frequency: "weekly" }));
    assert.ok(weekly.paymentPerPeriod < monthly.paymentPerPeriod);
  });

  test("a positive interest rate produces interest above zero and totalPaid above amountFinanced", () => {
    const result = calculateRepayment(baseInput({ annualRatePct: 7.9 }));
    assert.ok(result.totalInterest > 0);
    assert.ok(result.totalPaid > result.amountFinanced);
  });

  test("a higher rate produces more total interest than a lower rate, all else equal", () => {
    const low = calculateRepayment(baseInput({ annualRatePct: 5 }));
    const high = calculateRepayment(baseInput({ annualRatePct: 12 }));
    assert.ok(high.totalInterest > low.totalInterest);
    assert.ok(high.paymentPerPeriod > low.paymentPerPeriod);
  });

  test("a balloon payment reduces the periodic payment vs no balloon", () => {
    const noBalloon = calculateRepayment(baseInput({ annualRatePct: 7.9 }));
    const withBalloon = calculateRepayment(baseInput({ annualRatePct: 7.9, balloonPct: 30 }));
    assert.ok(withBalloon.balloonAmount > 0);
    assert.ok(
      withBalloon.paymentPerPeriod < noBalloon.paymentPerPeriod,
      "balloon payment should lower the regular instalment",
    );
  });

  test("balloonPct is clamped to [0, 100]", () => {
    const overMax = calculateRepayment(baseInput({ balloonPct: 150 }));
    const underMin = calculateRepayment(baseInput({ balloonPct: -10 }));
    assert.equal(overMax.balloonAmount, 30000); // clamped to 100%
    assert.equal(underMin.balloonAmount, 0); // clamped to 0%
  });

  test("totals are internally consistent within rounding: paymentPerPeriod*periods + balloon ≈ amountFinanced + totalInterest", () => {
    const result = calculateRepayment(baseInput({ annualRatePct: 7.9, balloonPct: 30 }));
    const reconstructed = result.paymentPerPeriod * result.periods + result.balloonAmount;
    const expected = result.amountFinanced + result.totalInterest;
    assert.ok(
      Math.abs(reconstructed - expected) < Math.max(2, expected * 0.005),
      `expected paymentPerPeriod*periods + balloon (${reconstructed}) ≈ amountFinanced + totalInterest (${expected})`,
    );
  });

  test("never returns a negative payment even for a fully-covered price (deposit >= price)", () => {
    const result = calculateRepayment(baseInput({ deposit: 40000 }));
    assert.equal(result.amountFinanced, 0);
    assert.ok(result.paymentPerPeriod >= 0);
  });
});

describe("estimateWeekly", () => {
  test("returns a positive whole-dollar weekly estimate", () => {
    const weekly = estimateWeekly(30000);
    assert.ok(Number.isInteger(weekly));
    assert.ok(weekly > 0);
  });

  test("scales up roughly with price", () => {
    const cheaper = estimateWeekly(15000);
    const pricier = estimateWeekly(45000);
    assert.ok(pricier > cheaper);
  });
});
