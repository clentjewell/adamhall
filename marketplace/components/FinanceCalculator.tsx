"use client";

import { useMemo, useState } from "react";
import { calculateRepayment, type RepaymentFrequency } from "@/lib/finance";
import { formatPrice } from "@/lib/format";

const TERM_OPTIONS_MONTHS = [12, 24, 36, 48, 60, 72, 84];
const BALLOON_OPTIONS_PCT = [0, 10, 15, 20, 25, 30, 35, 40];
const FREQUENCIES: { value: RepaymentFrequency; label: string; suffix: string }[] = [
  { value: "weekly", label: "Weekly", suffix: "wk" },
  { value: "fortnightly", label: "Fortnightly", suffix: "fn" },
  { value: "monthly", label: "Monthly", suffix: "mth" },
];

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

  return (
    <div className="card p-6">
      <h2 className="font-display font-bold text-xl mb-5">Repayment calculator</h2>

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
            className="input"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
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
            className="input"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value) || 0)}
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
            className="input"
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
            className="input"
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
        <p className="label">Repayment frequency</p>
        <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Repayment frequency">
          {FREQUENCIES.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={frequency === f.value}
              onClick={() => setFrequency(f.value)}
              className={`btn text-sm py-2.5 px-3 ${
                frequency === f.value
                  ? "bg-forest-600 text-white"
                  : "border-2 border-stone-200 text-stone-600 hover:border-forest-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-forest-50 p-5 text-center">
        <p className="text-sm font-semibold text-forest-700">Estimated repayment</p>
        <p className="font-display font-extrabold text-4xl text-forest-700 mt-1">
          {formatPrice(result.paymentPerPeriod)}
          <span className="text-lg font-bold">/{activeFreq.suffix}</span>
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-stone-500">Amount financed</dt>
          <dd className="font-semibold">{formatPrice(result.amountFinanced)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Total interest</dt>
          <dd className="font-semibold">{formatPrice(result.totalInterest)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Total payable</dt>
          <dd className="font-semibold">{formatPrice(result.totalPaid)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Balloon at end of term</dt>
          <dd className="font-semibold">
            {result.balloonAmount > 0 ? formatPrice(result.balloonAmount) : "—"}
          </dd>
        </div>
      </dl>

      <p className="helper mt-5 leading-relaxed">
        Estimates only — this isn&apos;t an offer or approval of finance.
        Actual rates and fees depend on the lender&apos;s assessment of you
        and the vehicle. Comparison rate warning:{" "}
        [legal review required for jurisdiction wording].
      </p>
    </div>
  );
}
