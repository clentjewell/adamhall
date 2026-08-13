"use client";

import { useActionState } from "react";
import { updatePassword, type AdminActionState } from "@/app/actions/admin";

const initial: AdminActionState = { ok: false };

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="label">New password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          autoFocus
          className="input"
          autoComplete="new-password"
        />
        <p className="helper mt-1">At least 10 characters.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="label">Confirm new password</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={10}
          className="input"
          autoComplete="new-password"
        />
      </div>
      {state.error && <p className="error-text" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
