"use client";

import { useActionState } from "react";
import { updateBuyerProfile, type AccountActionState } from "@/app/actions/account";
import type { Buyer } from "@/lib/buyer";

const initial: AccountActionState = { ok: false };

/** Kept in step with the buyer_profiles check constraint and the same list
    the register form offers. */
const HEARD_ABOUT: { value: string; label: string }[] = [
  { value: "radio", label: "On the radio" },
  { value: "google", label: "Google" },
  { value: "social", label: "Social media" },
  { value: "friend", label: "A friend told me" },
  { value: "returning", label: "I have bought or sold here before" },
  { value: "other", label: "Somewhere else" },
];

export default function DetailsForm({ buyer }: { buyer: Buyer }) {
  const [state, action, pending] = useActionState(updateBuyerProfile, initial);

  return (
    <form action={action} className="card p-6 space-y-4">
      <div>
        <label className="label" htmlFor="d-name">Name</label>
        <input
          id="d-name"
          name="full_name"
          required
          defaultValue={buyer.fullName}
          autoComplete="name"
          className="input"
        />
      </div>

      {/* Email is shown because people expect to see which address the
          account is on, but it is not editable here: changing it means
          re-confirming the new address, which is its own flow. */}
      <div>
        <label className="label" htmlFor="d-email">Email</label>
        <input id="d-email" value={buyer.email} disabled className="input" />
        <p className="helper">
          Ring us if this needs changing.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="d-phone">
          Phone <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <input
          id="d-phone"
          name="phone"
          type="tel"
          defaultValue={buyer.phone ?? ""}
          autoComplete="tel"
          className="input"
        />
        <p className="helper">So we can call you back about a car you enquire on.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="d-suburb">
            Suburb <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <input
            id="d-suburb"
            name="suburb"
            defaultValue={buyer.suburb ?? ""}
            autoComplete="address-level2"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="d-postcode">
            Postcode <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <input
            id="d-postcode"
            name="postcode"
            inputMode="numeric"
            defaultValue={buyer.postcode ?? ""}
            autoComplete="postal-code"
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="d-heard">
          How did you find us? <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <select
          id="d-heard"
          name="heard_about"
          defaultValue={buyer.heardAbout ?? ""}
          className="input"
        >
          <option value="">Rather not say</option>
          {HEARD_ABOUT.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {state.error && <p className="error-text" role="alert">{state.error}</p>}
      {state.ok && (
        <p className="text-sm font-semibold text-forest-700" role="status">
          Saved.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-cta">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
