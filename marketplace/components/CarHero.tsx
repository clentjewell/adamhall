"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CarPhoto } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { EASE } from "@/components/motion/Reveal";

// Full-bleed photographic hero for a car page. The thumbnails switch the
// hero image with a crossfade — continuity, not spectacle.
export default function CarHero({
  photos,
  title,
  price,
  sold,
}: {
  photos: CarPhoto[];
  title: string;
  price: number;
  sold: boolean;
}) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = photos[Math.min(active, Math.max(photos.length - 1, 0))];

  return (
    <section data-header-tone="dark" className="relative -mt-16 h-[52vh] min-h-[360px] md:h-[68vh] bg-ink">
      {current ? (
        <AnimatePresence initial={false}>
          <motion.div
            key={current.url}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Image
              src={current.url}
              alt={current.alt ?? title}
              fill
              priority={active === 0}
              sizes="100vw"
              className={`object-cover ${sold ? "opacity-75" : ""}`}
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-stone-400">
          Photos coming shortly
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="max-w-6xl mx-auto px-4 pb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            {sold && (
              <span className="inline-block bg-amber-accent text-white text-xs font-bold tracking-wide px-3 py-1.5 rounded-full mb-3">
                SOLD
              </span>
            )}
            <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight text-white leading-tight">
              {title}
            </h1>
            {!sold && (
              <p className="mt-1.5 text-2xl md:text-3xl font-extrabold text-white">
                {formatPrice(price)}
                <span className="text-sm font-semibold text-stone-300 ml-2">drive away</span>
              </p>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
              {photos.map((p, i) => (
                <button
                  key={p.url}
                  onClick={() => setActive(i)}
                  aria-label={`View photo ${i + 1}`}
                  aria-current={i === active}
                  className={`relative w-20 md:w-24 aspect-[3/2] rounded-lg overflow-hidden shrink-0 transition-all ${
                    i === active
                      ? "ring-2 ring-white"
                      : "opacity-60 hover:opacity-100"
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
      </div>
    </section>
  );
}
