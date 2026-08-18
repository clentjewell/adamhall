"use client";

import { useState, useTransition } from "react";
import { deleteBuyer, setBuyerPassword, setBuyerSuspended } from "@/app/actions/admin";

/**
 * The three things Adam can do to a buyer's account.
 *
 * Set apart from the rest of the profile and worded plainly, because two of
 * them are not undoable from here: a deleted account is gone, and a password
 * he sets is one the buyer no longer knows. Both ask for confirmation, and
 * deletion asks him to type the word rather than click a second button — a
 * second button is just a slower first button.
 */
export default function BuyerActions({
  userId,
  name,
  suspended,
}: {
  userId: string;
  name: string;
  suspended: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMessage: string) =>
    startTransition(async () => {
      setError(null);
      setDone(null);
      const r = await fn();
      if (!r.ok) setError(r.error ?? "That didn't work.");
      else setDone(okMessage);
    });

  return (
    <div className="space-y-6">
      {/* Password */}
      <div>
        <h3 className="font-bold text-sm">Set a new password</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-[52ch]">
          For when someone rings up locked out and cannot get to their email.
          Tell them what you set it to — they will not be told automatically.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 10 characters"
            className="input !w-auto flex-1 min-w-[16rem] text-sm"
            autoComplete="off"
          />
          <button
            disabled={pending || password.length < 10}
            onClick={() => {
              run(() => setBuyerPassword(userId, password), "Password changed.");
              setPassword("");
            }}
            className="btn-secondary text-sm"
          >
            Set password
          </button>
        </div>
      </div>

      {/* Suspend */}
      <div className="border-t border-stone-100 pt-5">
        <h3 className="font-bold text-sm">
          {suspended ? "Account is suspended" : "Suspend this account"}
        </h3>
        <p className="text-xs text-stone-500 mt-1 max-w-[52ch]">
          {suspended
            ? "They cannot sign in. Their saved cars and enquiries are untouched and come back with them."
            : "Blocks them from signing in. Nothing is deleted, and you can lift it again here."}
        </p>
        <button
          disabled={pending}
          onClick={() =>
            run(
              () => setBuyerSuspended(userId, !suspended),
              suspended ? "Account restored." : "Account suspended.",
            )
          }
          className={`${suspended ? "btn-primary" : "btn-secondary"} text-sm mt-3`}
        >
          {suspended ? "Lift the suspension" : "Suspend account"}
        </button>
      </div>

      {/* Delete */}
      <div className="border-t border-stone-100 pt-5">
        <h3 className="font-bold text-sm text-red-800">Delete this account</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-[52ch]">
          Removes {name}&apos;s login, details, saved cars and comparison. Their
          enquiries stay in your inbox — deleting an account should not wipe a
          conversation you may be part-way through. This cannot be undone.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="input !w-auto min-w-[14rem] text-sm"
            autoComplete="off"
          />
          <button
            disabled={pending || confirmText !== "DELETE"}
            onClick={() => run(() => deleteBuyer(userId), "Account deleted.")}
            className="btn text-sm bg-red-700 text-white hover:bg-red-800 disabled:opacity-40"
          >
            Delete account
          </button>
        </div>
      </div>

      {error && <p className="error-text" role="alert">{error}</p>}
      {done && (
        <p className="text-sm font-semibold text-forest-700" role="status">
          {done}
        </p>
      )}
    </div>
  );
}
