"use client";

import { useActionState } from "react";
import { Link } from "next-view-transitions";
import { registerBuyer, type AccountActionState } from "@/app/actions/account";

const initial: AccountActionState = { ok: false };

/** The options the buyer_profiles check constraint allows, with the wording
    a person actually recognises. Keys are stored, labels are shown. */
const HEARD_ABOUT = [
  { value: "radio", label: "On the radio" },
  { value: "google", label: "Google" },
  { value: "social", label: "Facebook or Instagram" },
  { value: "friend", label: "Someone told me" },
  { value: "returning", label: "I have bought or sold here before" },
  { value: "other", label: "Something else" },
];

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerBuyer, initial);

  if (state.ok && state.checkInbox) {
    return (
      <div className="card p-8" role="status">
        <h2 className="type-subheading">Check your email</h2>
        <p className="mt-3 text-stone-600">
          We have sent you a link to confirm the address. Open it and your
          account is ready. It only works once, so if the page does not load,
          ask for a new link rather than reloading.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="r-name">Your name</label>
          <input id="r-name" name="full_name" required autoComplete="name" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="r-email">Email</label>
          <input id="r-email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="r-password">Password</label>
          <input
            id="r-password"
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="input"
          />
          <p className="helper mt-1">At least 10 characters.</p>
        </div>

        {/* Everything below is optional and says so. A shortlist does not
            need a phone number to work; asking without demanding is the
            difference between a short form and a wall. */}
        <div>
          <label className="label" htmlFor="r-phone">
            Phone <span className="font-normal text-meta">(optional)</span>
          </label>
          <input id="r-phone" name="phone" type="tel" autoComplete="tel" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="r-suburb">
            Suburb <span className="font-normal text-meta">(optional)</span>
          </label>
          <input
            id="r-suburb"
            name="suburb"
            autoComplete="address-level2"
            placeholder="Tweed Heads"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="r-postcode">
            Postcode <span className="font-normal text-meta">(optional)</span>
          </label>
          <input
            id="r-postcode"
            name="postcode"
            inputMode="numeric"
            autoComplete="postal-code"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="r-heard">
            How did you find us? <span className="font-normal text-meta">(optional)</span>
          </label>
          <select id="r-heard" name="heard_about" defaultValue="" className="input">
            <option value="">Rather not say</option>
            {HEARD_ABOUT.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <p className="error-text mt-4" role="alert">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-cta mt-6 w-full sm:w-auto">
        {pending ? "Creating your account…" : "Create my account"}
      </button>

      <p className="helper mt-5">
        Already have an account? <Link href="/account/sign-in" className="underline">Sign in</Link>.
      </p>
    </form>
  );
}
