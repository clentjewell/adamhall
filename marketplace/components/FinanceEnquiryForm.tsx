"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitFinanceEnquiry, type FinanceActionState } from "@/app/actions/finance";

const initial: FinanceActionState = { ok: false };

export default function FinanceEnquiryForm({
  carId,
  carName,
  defaultAmount,
}: {
  carId?: string;
  carName?: string;
  defaultAmount?: number;
}) {
  const [state, action, pending] = useActionState(submitFinanceEnquiry, initial);

  if (state.ok) {
    return (
      <div className="card p-6 text-center" role="status">
        <p className="font-display font-bold text-lg text-forest-700">
          Good as sorted.
        </p>
        <p className="text-stone-600 mt-2 text-sm leading-relaxed">
          Adam or our finance partner will call you within one business day.
          No obligation, no credit check until you say go.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card p-6">
      {carId && <input type="hidden" name="car_id" value={carId} />}
      <h2 className="font-display font-bold text-xl mb-5">Get finance sorted</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="fe-name" className="label">
            Name
          </label>
          <input id="fe-name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="fe-phone" className="label">
            Phone
          </label>
          <input
            id="fe-phone"
            name="phone"
            type="tel"
            required
            className="input"
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="fe-email" className="label">
            Email
          </label>
          <input
            id="fe-email"
            name="email"
            type="email"
            required
            className="input"
            autoComplete="email"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fe-amount" className="label">
              Amount to finance <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="fe-amount"
              name="amount"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              defaultValue={defaultAmount}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="fe-deposit" className="label">
              Deposit <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="fe-deposit"
              name="deposit"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              className="input"
            />
          </div>
        </div>
        <div>
          <label htmlFor="fe-term" className="label">
            Preferred term <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <select id="fe-term" name="term_months" className="input" defaultValue="">
            <option value="">No preference</option>
            <option value="12">1 year</option>
            <option value="24">2 years</option>
            <option value="36">3 years</option>
            <option value="48">4 years</option>
            <option value="60">5 years</option>
            <option value="72">6 years</option>
            <option value="84">7 years</option>
          </select>
        </div>
        <div>
          <label htmlFor="fe-msg" className="label">
            Anything specific? <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <textarea
            id="fe-msg"
            name="message"
            rows={3}
            className="input resize-none"
            placeholder={
              carName ? `Financing the ${carName}…` : "Trade-in, timing, whatever's relevant…"
            }
          />
        </div>
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="fe-consent"
            name="consent"
            type="checkbox"
            className="mt-1 w-4 h-4 rounded border-stone-300 text-forest-600 focus:ring-forest-500"
          />
          <label htmlFor="fe-consent" className="text-sm text-stone-600 leading-relaxed">
            I agree to my details being passed to Adam Hall&apos;s finance
            partner so they can contact me about this enquiry. See our{" "}
            <Link href="/legal/privacy" className="underline text-forest-700">
              privacy policy
            </Link>
            .
          </label>
        </div>
      </div>

      {state.error && <p className="error-text">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full mt-5">
        {pending ? "Sending…" : "Get finance sorted"}
      </button>
    </form>
  );
}
