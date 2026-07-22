// Pure repayment maths for the finance calculator and "from $X/wk" card
// estimates. No I/O here — keep it testable and framework-free.

export type RepaymentFrequency = "weekly" | "fortnightly" | "monthly";

export interface RepaymentInput {
  price: number;
  deposit: number;
  tradeIn: number;
  termMonths: number;
  annualRatePct: number;
  balloonPct: number;
  frequency: RepaymentFrequency;
}

export interface RepaymentResult {
  paymentPerPeriod: number;
  totalInterest: number;
  totalPaid: number;
  amountFinanced: number;
  balloonAmount: number;
  periods: number;
}

const PERIODS_PER_YEAR: Record<RepaymentFrequency, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Standard amortisation with a balloon (residual) treated as a future
// value due at the final period:
//   payment = (P - B / (1+i)^n) * i / (1 - (1+i)^-n)
// where i is the periodic rate and n the number of periods. Falls back to
// straight-line division when the rate is zero, since the formula above
// is undefined at i = 0.
export function calculateRepayment(input: RepaymentInput): RepaymentResult {
  const freq = PERIODS_PER_YEAR[input.frequency];

  const amountFinanced = Math.max(
    0,
    input.price - input.deposit - input.tradeIn,
  );
  const balloonPct = Math.min(100, Math.max(0, input.balloonPct));
  const balloonAmount = amountFinanced * (balloonPct / 100);
  const periods = Math.max(1, Math.round((input.termMonths / 12) * freq));
  const i = Math.max(0, input.annualRatePct) / 100 / freq;

  let paymentPerPeriod: number;
  if (i === 0) {
    paymentPerPeriod = (amountFinanced - balloonAmount) / periods;
  } else {
    const growth = Math.pow(1 + i, periods);
    paymentPerPeriod =
      ((amountFinanced - balloonAmount / growth) * i) /
      (1 - Math.pow(1 + i, -periods));
  }
  paymentPerPeriod = Math.max(0, paymentPerPeriod);

  const totalPaid = paymentPerPeriod * periods + balloonAmount;
  const totalInterest = Math.max(0, totalPaid - amountFinanced);

  return {
    paymentPerPeriod: round2(paymentPerPeriod),
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(totalPaid),
    amountFinanced: round2(amountFinanced),
    balloonAmount: round2(balloonAmount),
    periods,
  };
}

// Quick "from $X/wk" estimate for car cards: 10% deposit, 5-year term,
// 9.5% p.a., no balloon, weekly repayments. Returns a whole-dollar figure.
export function estimateWeekly(price: number): number {
  const result = calculateRepayment({
    price,
    deposit: price * 0.1,
    tradeIn: 0,
    termMonths: 60,
    annualRatePct: 9.5,
    balloonPct: 0,
    frequency: "weekly",
  });
  return Math.round(result.paymentPerPeriod);
}
