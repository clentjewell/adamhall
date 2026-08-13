"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AdminActionState } from "@/app/actions/admin";

const initial: AdminActionState = { ok: false };

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  // Worded so it says the same thing whether or not the address has an
  // account. See the action: reporting the difference would let anyone test
  // who has access to the console.
  if (state.ok) {
    return (
      <p className="text-stone-600" role="status">
        If that address has a console account, a reset link is on its way. It
        lasts an hour and works once.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          className="input"
          autoComplete="email"
        />
      </div>
      {state.error && <p className="error-text" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
