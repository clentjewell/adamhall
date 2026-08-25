"use client";

import { useActionState } from "react";
import { updateBuyerPassword, type AccountActionState } from "@/app/actions/account";

const initial: AccountActionState = { ok: false };

export default function PasswordForm() {
  const [state, action, pending] = useActionState(updateBuyerPassword, initial);

  return (
    <form action={action} className="card p-6 space-y-4">
      <div>
        <label className="label" htmlFor="p-new">New password</label>
        <input
          id="p-new"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className="input"
        />
        <p className="helper">At least 10 characters.</p>
      </div>
      <div>
        <label className="label" htmlFor="p-confirm">Type it again</label>
        <input
          id="p-confirm"
          name="confirm"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className="input"
        />
      </div>

      {state.error && <p className="error-text" role="alert">{state.error}</p>}
      {state.ok && (
        <p className="text-sm font-semibold text-forest-700" role="status">
          Password changed. You stay signed in on this device.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-cta">
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
