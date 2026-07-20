"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertToListing } from "@/app/actions/admin";

export default function ConvertButton({
  submissionId,
  existing,
}: {
  submissionId: string;
  existing: { id: string; slug: string } | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (existing) {
    return (
      <div className="card p-5">
        <h2 className="font-bold mb-2">Listing</h2>
        <p className="text-sm text-stone-600">
          This car already has a listing.{" "}
          <Link href={`/admin/inventory/${existing.id}`} className="text-forest-700 font-semibold underline">
            Open it
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold mb-2">Turn it into stock</h2>
      <p className="text-sm text-stone-600 mb-4">
        Pre-fills a draft listing from the seller&apos;s answers and photos.
        You polish, then publish.
      </p>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const r = await convertToListing(submissionId);
            if (!r.ok || !r.id) {
              setError(r.error ?? "Conversion failed.");
              return;
            }
            router.push(`/admin/inventory/${r.id}`);
          })
        }
        className="btn-primary w-full !py-2.5 text-sm"
      >
        {pending ? "Building draft…" : "Convert to listing"}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
