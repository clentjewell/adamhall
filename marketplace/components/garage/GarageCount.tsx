"use client";

import { useEffect, useState } from "react";
import { getSaved, getCompare, onGarageChange } from "@/lib/garage";

/**
 * Count badge for the Saved and Compare nav items.
 *
 * Both are per-visitor localStorage state, so for a first-time visitor they are
 * empty. Rendering the count keeps the nav honest: the item reads as a place
 * they have put something rather than an empty promise. Renders nothing at zero
 * and nothing before mount, which also keeps it clear of hydration mismatch.
 */
export default function GarageCount({ kind }: { kind: "saved" | "compare" }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const read = () => setCount(kind === "saved" ? getSaved().length : getCompare().length);
    read();
    return onGarageChange(read);
  }, [kind]);

  if (!count) return null;

  return (
    <span
      aria-hidden="true"
      className="ml-1.5 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full bg-forest-600 text-white text-[10px] font-bold leading-none align-middle"
    >
      {count}
    </span>
  );
}
