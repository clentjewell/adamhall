"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { calculateRepayment, type RepaymentFrequency } from "@/lib/finance";
import { formatPrice } from "@/lib/format";
import { DUR, EASE_STANDARD } from "@/components/motion/Reveal";

const TERM_OPTIONS_MONTHS = [12, 24, 36, 48, 60, 72, 84];
const BALLOON_OPTIONS_PCT = [0, 10, 15, 20, 25, 30, 35, 40];
const FREQUENCIES: { value: RepaymentFrequency; label: string; suffix: string }[] = [
  { value: "weekly", label: "Weekly", suffix: "wk" },
  { value: "fortnightly", label: "Fortnightly", suffix: "fn" },
  { value: "monthly", label: "Monthly", suffix: "mth" },
];

const SLIDER_MAX_PRICE = 150_000;

// Interactive repayment estimator. Every field is a controlled number/select
// input so the results panel recalculates live — no submit button, nothing
// to send anywhere. Pairs with FinanceEnquiryForm for the actual lead.
export default function FinanceCalculator({ defaultPrice }: { defaultPrice?: number }) {
  const startPrice = defaultPrice ?? 35000;
  const [price, setPrice] = useState(startPrice);
  const [deposit, setDeposit] = useState(Math.round(startPrice * 0.1));
  const [tradeIn, setTradeIn] = useState(0);
  const [termMonths, setTermMonths] = useState(60);
  const [annualRatePct, setAnnualRatePct] = useState(9.5);
  const [balloonPct, setBalloonPct] = useState(0);
  const [frequency, setFrequency] = useState<RepaymentFrequency>("weekly");
  const reduce = useReducedMotion();

  const result = useMemo(
    () =>
      calculateRepayment({
        price: Math.max(0, price),
        deposit: Math.max(0, deposit),
        tradeIn: Math.max(0, tradeIn),
        termMonths,
        annualRatePct: Math.max(0, annualRatePct),
        balloonPct,
        frequency,
      }),
    [price, deposit, tradeIn, termMonths, annualRatePct, balloonPct, frequency],
  );

  const activeFreq = FREQUENCIES.find((f) => f.value === frequency)!;
  // Standard token for state changes (identity section 13); instant
  // under reduced motion.
  const t = reduce
    ? { duration: 0 }
    : { duration: DUR.standard, ease: EASE_STANDARD };

  // What the money is made of: the amount financed versus the interest paid
  // on top of it. Drawn as one bar so the cost of the loan is visible, not
  // buried in the table.
  const principalShare =
    result.totalPaid > 0 ? result.amountFinanced / result.totalPaid : 1;

  return (
    <div className="card p-6">
      <h2 className="type-subheading mb-5">Repayment calculator</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fc-price" className="label">
            Vehicle price
          </label>
          <input
            id="fc-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            className="input tabular"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
          />
          <input
            type="range"
            aria-label="Vehicle price, slider"
            className="mt-2 w-full accent-forest-600"
            min={5000}
            max={SLIDER_MAX_PRICE}
            step={500}
            value={Math.min(Math.max(price, 5000), SLIDER_MAX_PRICE)}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="fc-deposit" className="label">
            Deposit
          </label>
          <input
            id="fc-deposit"
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            className="input tabular"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value) || 0)}
          />
          <input
            type="range"
            aria-label="Deposit, slider"
            className="mt-2 w-full accent-forest-600"
            min={0}
            max={Math.max(price, 500)}
            step={500}
            value={Math.min(deposit, Math.max(price, 500))}
            onChange={(e) => setDeposit(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="fc-tradein" className="label">
            Trade-in value <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <input
            id="fc-tradein"
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            className="input tabular"
            value={tradeIn}
            onChange={(e) => setTradeIn(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <label htmlFor="fc-rate" className="label">
            Interest rate (% p.a.)
          </label>
          <input
            id="fc-rate"
            type="number"
            inputMode="decimal"
            min={0}
            max={30}
            step={0.1}
            className="input tabular"
            value={annualRatePct}
            onChange={(e) => setAnnualRatePct(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <label htmlFor="fc-term" className="label">
            Loan term
          </label>
          <select
            id="fc-term"
            className="input"
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value))}
          >
            {TERM_OPTIONS_MONTHS.map((m) => (
              <option key={m} value={m}>
                {m / 12} year{m / 12 > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fc-balloon" className="label">
            Balloon payment
          </label>
          <select
            id="fc-balloon"
            className="input"
            value={balloonPct}
            onChange={(e) => setBalloonPct(Number(e.target.value))}
          >
            {BALLOON_OPTIONS_PCT.map((b) => (
              <option key={b} value={b}>
                {b === 0 ? "No balloon" : `${b}% of amount financed`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <p className="label" id="fc-freq-label">
          Repayment frequency
        </p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="fc-freq-label">
          {FREQUENCIES.map((f) => {
            const active = frequency === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFrequency(f.value)}
                className={`btn relative text-sm py-2.5 px-3 ${
                  active
                    ? "text-white"
                    : "border-2 border-stone-200 text-stone-600 hover:border-forest-200"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="fc-freq-active"
                    className="absolute inset-0 rounded-full bg-forest-600"
                    transition={t}
                    aria-hidden="true"
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-forest-50 p-5 text-center">
        <p className="text-sm font-semibold text-forest-700">Estimated repayment</p>
        {/* Prices never count up and never flicker on change (identity
            section 13). The figure simply updates; the bar below moves. */}
        <p className="type-price-lg font-display text-forest-700 mt-1">
          {formatPrice(Math.round(result.paymentPerPeriod))}
          <span className="text-lg font-bold">/{activeFreq.suffix}</span>
        </p>
      </div>

      {/* What the total is made of: the car versus the cost of the money. */}
      <div className="mt-5" aria-hidden="true">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-stone-200">
          <motion.div
            className="absolute inset-y-0 left-0 w-full bg-forest-600"
            style={{ transformOrigin: "left" }}
            animate={{ scaleX: principalShare }}
            transition={t}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-stone-500">
          <span>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-forest-600" />
            Amount financed{" "}
            <span className="tabular font-semibold text-ink">
              {formatPrice(result.amountFinanced)}
            </span>
          </span>
          <span>
            Interest{" "}
            <span className="tabular font-semibold text-ink">
              {formatPrice(result.totalInterest)}
            </span>
          </span>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-stone-500">Total payable</dt>
          <dd className="tabular font-semibold">{formatPrice(result.totalPaid)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Balloon at end of term</dt>
          <dd className="tabular font-semibold">
            {result.balloonAmount > 0 ? formatPrice(result.balloonAmount) : "—"}
          </dd>
        </div>
      </dl>

      <p className="helper mt-5 leading-relaxed">
        Estimates only. This isn&apos;t an offer or approval of finance.
        Actual rates and fees depend on the lender&apos;s assessment of you
        and the vehicle. Comparison rate warning:{" "}
        [legal review required for jurisdiction wording].
      </p>
    </div>
  );
}
