"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react";
import { getSaved, onGarageChange } from "@/lib/garage";

/**
 * Header nav link to /saved: heart icon + count badge of saved cars.
 * Style-agnostic — pass `className` to match the surrounding nav (this
 * component renders no layout/spacing of its own beyond the badge dot).
 */
export default function GarageNavBadge({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getSaved().length);
    setMounted(true);
    sync();
    const unsubscribe = onGarageChange(sync);
    return unsubscribe;
  }, []);

  const show = mounted && count > 0;

  return (
    <Link href="/saved" className={className} aria-label={show ? `Saved cars (${count})` : "Saved cars"}>
      <span className="relative inline-flex">
        <Heart size={20} weight={show ? "fill" : "regular"} />
        {show && (
          <span className="absolute -top-2 -right-2.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-forest-600 text-white text-[10px] font-bold leading-none">
            {count}
          </span>
        )}
      </span>
    </Link>
  );
}
