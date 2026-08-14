"use client";

import { useActionState } from "react";
import { Link } from "next-view-transitions";
import { signInBuyer, type AccountActionState } from "@/app/actions/account";

const initial: AccountActionState = { ok: false };

export default function SignInForm() {
  const [state, action, pending] = useActionState(signInBuyer, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="s-email">Email</label>
        <input
          id="s-email"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="s-password">Password</label>
        <input
          id="s-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
        />
      </div>

      {state.error && <p className="error-text" role="alert">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-cta w-full">
        {pending ? "Signing you in…" : "Sign in"}
      </button>

      <p className="helper">
        No account yet?{" "}
        <Link href="/account/register" className="underline">Create one</Link>.
      </p>
    </form>
  );
}
