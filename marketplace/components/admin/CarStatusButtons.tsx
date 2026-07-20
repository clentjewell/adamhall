"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setCarStatus } from "@/app/actions/admin";
import type { CarStatus } from "@/lib/types";

export default function CarStatusButtons({
  carId,
  status,
  slug,
}: {
  carId: string;
  status: CarStatus;
  slug: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const move = (next: CarStatus) =>
    startTransition(async () => {
      setError(null);
      const r = await setCarStatus(carId, next);
      if (!r.ok) setError(r.error ?? "Failed.");
    });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status === "draft" && (
        <button onClick={() => move("published")} disabled={pending} className="btn-primary !py-2 !px-4 text-xs">
          Publish
        </button>
      )}
      {status === "published" && (
        <>
          <Link href={`/cars/${slug}`} target="_blank" className="btn-ghost !py-2 !px-3 text-xs">
            View live
          </Link>
          <button onClick={() => move("sold")} disabled={pending} className="btn-primary !py-2 !px-4 text-xs">
            Mark sold
          </button>
          <button onClick={() => move("draft")} disabled={pending} className="btn-ghost !py-2 !px-3 text-xs !text-stone-500">
            Unpublish
          </button>
        </>
      )}
      {status === "sold" && (
        <button onClick={() => move("archived")} disabled={pending} className="btn-ghost !py-2 !px-3 text-xs !text-stone-500">
          Archive now
        </button>
      )}
      {status === "archived" && (
        <button onClick={() => move("draft")} disabled={pending} className="btn-ghost !py-2 !px-3 text-xs !text-stone-500">
          Back to draft
        </button>
      )}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
