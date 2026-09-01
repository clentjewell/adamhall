"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CarPhoto } from "@/lib/types";
import { EASE_STANDARD } from "@/components/motion/Reveal";

// Boxed gallery for the car page, per the UI mockups: a rounded frame with
// a photo counter, thumbnails beneath. Thumbnails cross-fade the main
// image — continuity, not spectacle — inside the identity's 400ms gallery
// cap. The frame carries the shared view-transition-name, so the listing
// card's photo morphs into it on navigation.
export default function CarGallery({
  photos,
  title,
  sold,
  transitionName,
}: {
  photos: CarPhoto[];
  title: string;
  sold: boolean;
  transitionName?: string;
}) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = photos[Math.min(active, Math.max(photos.length - 1, 0))];

  return (
    <div>
      <div
        className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-stone-200"
        style={transitionName ? { viewTransitionName: transitionName } : undefined}
      >
        {current ? (
          <AnimatePresence initial={false}>
            <motion.div
              key={current.url}
              className="absolute inset-0"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_STANDARD }}
            >
              <Image
                src={current.url}
                alt={current.alt ?? title}
                fill
                priority={active === 0}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className={`object-cover ${sold ? "opacity-75" : ""}`}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-400">
            Photos coming shortly
          </div>
        )}
        {sold && (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-amber-accent px-3 py-1.5 text-xs font-bold tracking-wide text-ink">
            SOLD
          </span>
        )}
        {photos.length > 1 && (
          <p className="tabular absolute bottom-3 right-3 z-10 rounded-full bg-ink/60 px-3 py-1 text-xs font-semibold text-white">
            {Math.min(active + 1, photos.length)} / {photos.length}
          </p>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p.url}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === active}
              className={`relative w-20 shrink-0 overflow-hidden rounded-lg aspect-[3/2] md:w-24 ${
                i === active
                  ? "ring-2 ring-forest-600"
                  : "opacity-60 hover:opacity-100 transition-opacity duration-[120ms]"
              }`}
            >
              <Image
                src={p.url}
                alt={p.alt ?? `${title} photo ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
