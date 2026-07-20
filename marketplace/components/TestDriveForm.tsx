"use client";

import { useActionState } from "react";
import { bookTestDrive, TIME_WINDOWS, type TestDriveActionState } from "@/app/actions/testdrive";

const initial: TestDriveActionState = { ok: false };

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TestDriveForm({ carId, carName }: { carId: string; carName: string }) {
  const [state, action, pending] = useActionState(bookTestDrive, initial);

  if (state.ok) {
    return (
      <div className="card p-6 text-center" role="status">
        <p className="font-display font-bold text-lg text-forest-700">
          Request in. We&apos;ll call to lock in the exact time — a test drive
          isn&apos;t confirmed until you hear from us.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card p-6" id="testdrive">
      <input type="hidden" name="car_id" value={carId} />

      <h3 className="font-display font-bold text-lg mb-4">
        Book a test drive
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="td-name" className="label">Name</label>
          <input id="td-name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="td-phone" className="label">Phone</label>
          <input id="td-phone" name="phone" type="tel" required className="input" autoComplete="tel" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="td-date" className="label">Preferred date</label>
            <input
              id="td-date"
              name="preferred_date"
              type="date"
              min={todayIso()}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="td-window" className="label">Time window</label>
            <select id="td-window" name="time_window" required className="input" defaultValue="">
              <option value="" disabled>
                Choose a time
              </option>
              {TIME_WINDOWS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <input
            id="td-licence"
            name="licence_confirmed"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-stone-300 text-forest-600 focus:ring-forest-500"
          />
          <label htmlFor="td-licence" className="text-sm text-ink font-medium">
            I hold a current driver&apos;s licence
          </label>
        </div>

        <div>
          <label htmlFor="td-msg" className="label">
            Anything specific? <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <textarea
            id="td-msg"
            name="message"
            rows={3}
            className="input resize-none"
            placeholder={`Questions about the ${carName}…`}
          />
        </div>
      </div>

      {state.error && <p className="error-text">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full mt-5">
        {pending ? "Sending…" : "Request a test drive"}
      </button>
      <p className="helper text-center">
        We confirm every booking by phone — nothing&apos;s locked in until we speak.
      </p>
    </form>
  );
}
