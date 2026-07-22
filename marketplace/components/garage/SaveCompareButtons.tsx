"use client";

import { useEffect, useState } from "react";
import { Heart, Scales, ShareNetwork } from "@phosphor-icons/react";
import { getCompare, getSaved, toggleCompare, toggleSaved, onGarageChange } from "@/lib/garage";

interface Props {
  carId: string;
  variant: "card" | "detail";
}

export default function SaveCompareButtons({ carId, variant }: Props) {
  // Render neutral (unsaved/not-compared) until mounted so the client's
  // first paint matches the server-rendered markup — localStorage doesn't
  // exist on the server, so state is only trustworthy after hydration.
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [compared, setCompared] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [shareFlash, setShareFlash] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSaved(getSaved().includes(carId));
      setCompared(getCompare().includes(carId));
    };
    setMounted(true);
    sync();
    const unsubscribe = onGarageChange(sync);
    return unsubscribe;
  }, [carId]);

  function handleSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggleSaved(carId));
  }

  function handleCompare(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleCompare(carId);
    if (!result.ok) {
      setCompareError(result.error ?? "Compare holds three cars — remove one first.");
      window.setTimeout(() => setCompareError(null), 3500);
      return;
    }
    setCompareError(null);
    setCompared(result.list.includes(carId));
  }

  async function handleShare(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ url, title: document.title });
      } catch {
        // User dismissed the native share sheet — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareFlash(true);
      window.setTimeout(() => setShareFlash(false), 2000);
    } catch {
      // Clipboard blocked (permissions/insecure context) — fail silently.
    }
  }

  if (variant === "card") {
    return (
      <div className="absolute top-3 right-3 flex gap-1.5 z-10">
        <button
          type="button"
          onClick={handleSave}
          aria-label={mounted && saved ? "Remove from saved cars" : "Save this car"}
          aria-pressed={mounted && saved}
          className={`rounded-full bg-white/90 backdrop-blur p-2 shadow transition-colors ${
            mounted && saved ? "text-forest-600" : "text-ink/70 hover:text-forest-600"
          }`}
        >
          <Heart size={18} weight={mounted && saved ? "fill" : "regular"} />
        </button>
        <button
          type="button"
          onClick={handleCompare}
          aria-label={mounted && compared ? "Remove from compare" : "Add to compare"}
          aria-pressed={mounted && compared}
          className={`rounded-full bg-white/90 backdrop-blur p-2 shadow transition-colors ${
            mounted && compared ? "text-forest-600" : "text-ink/70 hover:text-forest-600"
          }`}
        >
          <Scales size={18} weight={mounted && compared ? "fill" : "regular"} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleSave}
        aria-pressed={mounted && saved}
        className="btn-secondary text-sm !px-4 !py-2.5"
      >
        <Heart size={16} weight={mounted && saved ? "fill" : "regular"} />
        {mounted && saved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        onClick={handleCompare}
        aria-pressed={mounted && compared}
        className="btn-secondary text-sm !px-4 !py-2.5"
      >
        <Scales size={16} weight={mounted && compared ? "fill" : "regular"} />
        {mounted && compared ? "In compare" : "Compare"}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="btn-secondary text-sm !px-4 !py-2.5"
      >
        <ShareNetwork size={16} />
        {shareFlash ? "Link copied" : "Share"}
      </button>
      {compareError && <span className="error-text basis-full">{compareError}</span>}
    </div>
  );
}
