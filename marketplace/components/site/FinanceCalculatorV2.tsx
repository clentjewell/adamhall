"use client";

import { useMemo, useState } from "react";
import { calculateRepayment, type RepaymentFrequency } from "@/lib/finance";
import { formatPrice } from "@/lib/format";

/**
 * Redesigned repayment estimator (artifact frame 1g): controls on the left,
 * a standing results panel on the right.
 *
 * This is UI only. Every number on screen comes from calculateRepayment in
 * lib/finance.ts — the same amortisation used by the existing calculator and
 * by the "from $X/wk" figure on the cards — so there is no second copy of the
 * maths to keep in step. Nothing is submitted; the panel recalculates live.
 */
const TERMS = [3, 4, 5, 7];
const BALLOONS = [0, 20, 30];
const FREQUENCIES: { value: RepaymentFrequency; label: string; noun: string }[] = [
  { value: "weekly", label: "Weekly", noun: "per week" },
  { value: "fortnightly", label: "Fortnightly", noun: "per fortnight" },
  { value: "monthly", label: "Monthly", noun: "per month" },
];

const PRICE_MIN = 5_000;
const PRICE_MAX = 120_000;

export default function FinanceCalculatorV2({
  defaultPrice,
  quoteHref = "#finance-quote",
}: {
  defaultPrice?: number;
  /** Where "Get a real quote" sends people — the enquiry form below. */
  quoteHref?: string;
}) {
  const startPrice = defaultPrice ?? 35_000;
  const [price, setPrice] = useState(startPrice);
  const [deposit, setDeposit] = useState(Math.round(startPrice * 0.1));
  const [termYears, setTermYears] = useState(5);
  const [annualRatePct, setAnnualRatePct] = useState(7.95);
  const [balloonPct, setBalloonPct] = useState(0);
  const [frequency, setFrequency] = useState<RepaymentFrequency>("weekly");

  const result = useMemo(
    () =>
      calculateRepayment({
        price: Math.max(0, price),
        deposit: Math.max(0, Math.min(deposit, price)),
        tradeIn: 0,
        termMonths: termYears * 12,
        annualRatePct: Math.max(0, annualRatePct),
        balloonPct,
        frequency,
      }),
    [price, deposit, termYears, annualRatePct, balloonPct, frequency],
  );

  const activeFreq = FREQUENCIES.find((f) => f.value === frequency)!;

  return (
    <div className="mp2-calc">
      <div className="mp2-calc__controls">
        {/* Price */}
        <div className="mp2-calc__row">
          <label htmlFor="fc2-price" className="mp2-calc__label">
            Car price
          </label>
          <output className="mp2-calc__value" htmlFor="fc2-price">
            {formatPrice(price)}
          </output>
        </div>
        <input
          id="fc2-price"
          type="range"
          className="mp2-range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={500}
          value={Math.min(Math.max(price, PRICE_MIN), PRICE_MAX)}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <div className="mp2-calc__scale">
          <span>{formatPrice(PRICE_MIN)}</span>
          <span>{formatPrice(PRICE_MAX)}</span>
        </div>

        {/* Deposit */}
        <div className="mp2-calc__row mp2-calc__row--spaced">
          <label htmlFor="fc2-deposit" className="mp2-calc__label">
            Deposit / trade-in
          </label>
          <output className="mp2-calc__value" htmlFor="fc2-deposit">
            {formatPrice(deposit)}
          </output>
        </div>
        <input
          id="fc2-deposit"
          type="range"
          className="mp2-range"
          min={0}
          max={Math.max(price, 500)}
          step={500}
          value={Math.min(deposit, Math.max(price, 500))}
          onChange={(e) => setDeposit(Number(e.target.value))}
        />

        {/* Term + frequency */}
        <div className="mp2-calc__pair">
          <div>
            <p className="mp2-calc__label" id="fc2-term-label">
              Term
            </p>
            <div className="mp2-calc__chips" role="group" aria-labelledby="fc2-term-label">
              {TERMS.map((y) => (
                <button
                  key={y}
                  type="button"
                  aria-pressed={termYears === y}
                  onClick={() => setTermYears(y)}
                  className={`mp2-chip${termYears === y ? " mp2-chip--on" : ""}`}
                >
                  {y} yr
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mp2-calc__label" id="fc2-freq-label">
              Repayment
            </p>
            <div className="mp2-calc__chips" role="group" aria-labelledby="fc2-freq-label">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={frequency === f.value}
                  onClick={() => setFrequency(f.value)}
                  className={`mp2-chip${frequency === f.value ? " mp2-chip--on" : ""}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rate + balloon */}
        <div className="mp2-calc__pair mp2-calc__pair--fields">
          <div className="mp2-field">
            <label htmlFor="fc2-rate" className="mp2-field__label">
              Interest rate (indicative)
            </label>
            <input
              id="fc2-rate"
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={0.05}
              className="mp2-input tabular"
              value={annualRatePct}
              onChange={(e) => setAnnualRatePct(Number(e.target.value) || 0)}
            />
          </div>
          <div className="mp2-field">
            <label htmlFor="fc2-balloon" className="mp2-field__label">
              Balloon / residual
            </label>
            <select
              id="fc2-balloon"
              className="mp2-select"
              value={balloonPct}
              onChange={(e) => setBalloonPct(Number(e.target.value))}
            >
              {BALLOONS.map((b) => (
                <option key={b} value={b}>
                  {b === 0 ? "None" : `${b}%`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="mp2-calc__result">
        <p className="eyebrow">Estimated repayment</p>
        {/* The figure simply updates — prices never count up or flicker
            (identity section 13). */}
        <p className="mp2-calc__big tabular">
          {formatPrice(Math.round(result.paymentPerPeriod))}
        </p>
        <p className="mp2-calc__period">
          {activeFreq.noun} over {termYears} years
        </p>
        <ul className="mp2-calc__breakdown">
          <li>
            <span>Amount financed</span>
            <b className="tabular">{formatPrice(result.amountFinanced)}</b>
          </li>
          <li>
            <span>Total interest</span>
            <b className="tabular">{formatPrice(result.totalInterest)}</b>
          </li>
          <li>
            <span>Total repaid</span>
            <b className="tabular">{formatPrice(result.totalPaid)}</b>
          </li>
          {result.balloonAmount > 0 && (
            <li>
              <span>Balloon at end of term</span>
              <b className="tabular">{formatPrice(result.balloonAmount)}</b>
            </li>
          )}
        </ul>
        <a href={quoteHref} className="btn btn--tan mp2-calc__cta">
          Get a real quote
        </a>
        <p className="mp2-calc__disclaimer">
          Indicative only. Not an offer of finance. Rates depend on your
          circumstances and the lender&rsquo;s assessment. Comparison rate
          warning: [legal review required for jurisdiction wording].
        </p>
      </div>
    </div>
  );
}
