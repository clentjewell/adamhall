"use client";

import { useState, useTransition } from "react";
import { setCarAvailability } from "@/app/actions/admin";
import type { CarAvailability, CarStatus } from "@/lib/types";

const OPTIONS: { value: CarAvailability; label: string; hint: string }[] = [
  { value: "available", label: "Available", hint: "No badge on the site" },
  {
    value: "enquiry_in_progress",
    label: "Enquiry in progress",
    hint: "Someone is talking to you about it",
  },
  { value: "reserved", label: "Reserved", hint: "Holding it for a buyer" },
];

/**
 * Availability sits beside the status buttons on the car edit screen, not
 * inside CarForm: it is an immediate, single-purpose action like publishing,
 * not a field you fill in and save with the rest of the listing.
 *
 * It changes only when Adam changes it. Nothing expires it, nothing sets it
 * from an enquiry arriving, and it never takes a car off the site.
 */
export default function CarAvailabilityControl({
  carId,
  availability,
  status,
}: {
  carId: string;
  availability: CarAvailability;
  status: CarStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState<CarAvailability>(availability);
  const [error, setError] = useState<string | null>(null);

  // A sold car ignores availability entirely on the public side, so offering
  // the control here would imply a change that never shows up.
  if (status === "sold") return null;

  const move = (next: CarAvailability) => {
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const r = await setCarAvailability(carId, next);
      if (!r.ok) {
        setValue(previous);
        setError(r.error ?? "Failed.");
      }
    });
  };

  const current = OPTIONS.find((o) => o.value === value);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="car-availability" className="text-xs font-semibold text-stone-500">
        Availability
      </label>
      <select
        id="car-availability"
        value={value}
        disabled={pending || status !== "published"}
        onChange={(e) => move(e.target.value as CarAvailability)}
        className="input !py-2 !px-3 text-xs !w-auto"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {status !== "published" ? (
        <span className="text-xs text-stone-400">
          Publish the car first — nobody can see a badge on a {status} listing.
        </span>
      ) : (
        current && <span className="text-xs text-stone-400">{current.hint}</span>
      )}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
