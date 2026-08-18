"use client";

import { useActionState } from "react";
import { Link } from "next-view-transitions";
import { requestBuyerPasswordReset, type AccountActionState } from "@/app/actions/account";

const initial: AccountActionState = { ok: false };

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestBuyerPasswordReset, initial);

  // Worded so it says the same thing whether or not that address has an
  // account here — the action deliberately does not tell us which.
  if (state.ok) {
    return (
      <div role="status">
        <p className="font-display font-bold text-lg text-forest-700">
          Check your email
        </p>
        <p className="helper mt-2">
          If there is an account on that address, a link to set a new password
          is on its way. It is good for one use.
        </p>
        <Link href="/account/sign-in" className="btn-ghost text-sm mt-4 !px-0">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="f-email">Email</label>
        <input
          id="f-email"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          className="input"
        />
      </div>

      {state.error && <p className="error-text" role="alert">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-cta w-full">
        {pending ? "Sending…" : "Send me a link"}
      </button>

      <p className="helper">
        Remembered it?{" "}
        <Link href="/account/sign-in" className="underline">Sign in</Link>.
      </p>
    </form>
  );
}
