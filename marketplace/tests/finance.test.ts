import { test, describe } from "node:test";
import assert from "node:assert/strict";

// lib/finance.ts (repayment calculator behind the /finance page) is being
// built by a parallel workstream and did not exist at the time these tests
// were written. Rather than duplicate its logic here, we dynamically import
// it and skip gracefully if it's absent or doesn't yet export
// `calculateRepayment`. Once that module lands with a compatible shape,
// these tests start exercising it for real — no changes needed here.
//
// Assumed shape (adjust this comment if the real implementation differs):
//   calculateRepayment({ amountFinanced, annualRatePercent, termMonths,
//     frequency: "weekly" | "monthly", balloonAmount? })
//   -> { paymentPerPeriod, totalInterest, totalCost, periods }

type RepaymentInput = {
  amountFinanced: number;
  annualRatePercent: number;
  termMonths: number;
  frequency: "weekly" | "monthly";
  balloonAmount?: number;
};

type RepaymentResult = {
  paymentPerPeriod: number;
  totalInterest: number;
  totalCost: number;
  periods: number;
};

type CalculateRepayment = (input: RepaymentInput) => RepaymentResult;

let calculateRepayment: CalculateRepayment | undefined;

try {
  const mod: Record<string, unknown> = await import("../lib/finance");
  if (typeof mod.calculateRepayment === "function") {
    calculateRepayment = mod.calculateRepayment as CalculateRepayment;
  }
} catch {
  // lib/finance.ts doesn't exist yet — handled by `skip` below.
}

const skip = !calculateRepayment;
if (skip) {
  console.warn(
    "[tests/finance.test.ts] lib/finance.ts (calculateRepayment) not found yet — " +
      "skipping finance calculator tests. It is being added alongside the /finance " +
      "page and finance_enquiries table by a separate workstream.",
  );
}

describe("calculateRepayment", { skip }, () => {
  test("monthly, 0% interest: payment * periods reconstructs the amount financed", () => {
    const result = calculateRepayment!({
      amountFinanced: 30000,
      annualRatePercent: 0,
      termMonths: 60,
      frequency: "monthly",
    });
    assert.ok(result.periods > 0);
    assert.ok(result.paymentPerPeriod > 0);
    assert.equal(Math.round(result.totalInterest), 0);
    assert.ok(
      Math.abs(result.paymentPerPeriod * result.periods - 30000) < 1,
      "0% interest: total repaid should equal amount financed",
    );
  });

  test("weekly, 0% interest: total repaid still reconstructs the amount financed", () => {
    const result = calculateRepayment!({
      amountFinanced: 30000,
      annualRatePercent: 0,
      termMonths: 60,
      frequency: "weekly",
    });
    assert.ok(result.periods > 0);
    assert.ok(
      Math.abs(result.paymentPerPeriod * result.periods - 30000) < 1,
      "0% interest: total repaid should equal amount financed",
    );
  });

  test("weekly payments are smaller per-period than monthly for the same loan", () => {
    const monthly = calculateRepayment!({
      amountFinanced: 30000,
      annualRatePercent: 7.9,
      termMonths: 60,
      frequency: "monthly",
    });
    const weekly = calculateRepayment!({
      amountFinanced: 30000,
      annualRatePercent: 7.9,
      termMonths: 60,
      frequency: "weekly",
    });
    assert.ok(weekly.paymentPerPeriod < monthly.paymentPerPeriod);
    // Roughly 12 months worth of payments should be in the same ballpark as
    // roughly 52 weeks worth, within a generous tolerance (rounding, day-count
    // conventions can legitimately differ between implementations).
    const monthlyAnnualCost = monthly.paymentPerPeriod * 12;
    const weeklyAnnualCost = weekly.paymentPerPeriod * (weekly.periods / 5); // ~5yr term
    assert.ok(
      Math.abs(monthlyAnnualCost - weeklyAnnualCost) / monthlyAnnualCost < 0.15,
      "weekly and monthly annualised cost should be roughly comparable",
    );
  });

  test("a positive interest rate produces interest above zero", () => {
    const result = calculateRepayment!({
      amountFinanced: 30000,
      annualRatePercent: 7.9,
      termMonths: 60,
      frequency: "monthly",
    });
    assert.ok(result.totalInterest > 0);
    assert.ok(result.totalCost > 30000);
  });

  test("a balloon payment reduces the periodic payment vs no balloon", () => {
    const noBalloon = calculateRepayment!({
      amountFinanced: 30000,
      annualRatePercent: 7.9,
      termMonths: 60,
      frequency: "monthly",
    });
    const withBalloon = calculateRepayment!({
      amountFinanced: 30000,
      annualRatePercent: 7.9,
      termMonths: 60,
      frequency: "monthly",
      balloonAmount: 9000,
    });
    assert.ok(
      withBalloon.paymentPerPeriod < noBalloon.paymentPerPeriod,
      "balloon payment should lower the regular instalment",
    );
  });

  test("totals are internally consistent within rounding", () => {
    const balloonAmount = 9000;
    const result = calculateRepayment!({
      amountFinanced: 30000,
      annualRatePercent: 7.9,
      termMonths: 60,
      frequency: "monthly",
      balloonAmount,
    });
    const reconstructed = result.paymentPerPeriod * result.periods + balloonAmount;
    const expected = 30000 + result.totalInterest;
    // Allow a small rounding tolerance (cents-to-dollars rounding across
    // many periods can accumulate a little).
    assert.ok(
      Math.abs(reconstructed - expected) < Math.max(5, expected * 0.01),
      `expected paymentPerPeriod*periods + balloon (${reconstructed}) ≈ amountFinanced + totalInterest (${expected})`,
    );
  });
});
