"use client";

import { useActionState } from "react";
import { joinWatchlist, type ActionState } from "@/app/actions/public";
import { BellRinging } from "@phosphor-icons/react";

const initial: ActionState = { ok: false };

export default function WatchlistForm({ makes }: { makes: string[] }) {
  const [state, action, pending] = useActionState(joinWatchlist, initial);

  if (state.ok) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display font-bold text-lg text-forest-700">
          You&apos;re on the list
        </p>
        <p className="text-stone-600 mt-1">
          The moment a matching car lands, you&apos;ll get an email. Good cars
          go fast here, so keep an eye on your inbox.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card p-6">
      <div className="flex items-center gap-2 mb-1">
        <BellRinging size={20} className="text-forest-600" weight="bold" />
        <h3 className="font-display font-bold text-lg">
          Chasing something specific?
        </h3>
      </div>
      <p className="text-stone-600 text-sm mb-5">
        Tell us what you&apos;re after and we&apos;ll email you the moment one
        arrives. No account, no spam, just the car.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="wl-make" className="label">Make</label>
          <select id="wl-make" name="make" required className="input" defaultValue="">
            <option value="" disabled>Any make you like</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
            <option value="Other">Something else</option>
          </select>
        </div>
        <div>
          <label htmlFor="wl-model" className="label">Model <span className="font-normal text-stone-400">(optional)</span></label>
          <input id="wl-model" name="model" className="input" placeholder="Hilux, RAV4…" />
        </div>
        <div>
          <label htmlFor="wl-price" className="label">Budget up to <span className="font-normal text-stone-400">(optional)</span></label>
          <input id="wl-price" name="max_price" type="number" min="1000" step="500" className="input" placeholder="45000" />
        </div>
        <div>
          <label htmlFor="wl-email" className="label">Email</label>
          <input id="wl-email" name="email" type="email" required className="input" placeholder="you@email.com" />
        </div>
      </div>
      {state.error && <p className="error-text">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary mt-5 w-full sm:w-auto">
        {pending ? "Saving…" : "Watch for this car"}
      </button>
    </form>
  );
}
