"use client";

import Image from "next/image";
import { useState } from "react";
import type { CarPhoto } from "@/lib/types";

export default function Gallery({ photos, title }: { photos: CarPhoto[]; title: string }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="aspect-[3/2] rounded-2xl bg-stone-200 flex items-center justify-center text-stone-500">
        Photos coming shortly
      </div>
    );
  }

  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div>
      <div className="relative aspect-[3/2] rounded-2xl overflow-hidden bg-stone-200">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt ?? title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
          {photos.map((p, i) => (
            <button
              key={p.url}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-[3/2] rounded-lg overflow-hidden transition-all ${
                i === active
                  ? "ring-2 ring-forest-600 ring-offset-2 ring-offset-paper"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={p.url}
                alt={p.alt ?? `${title} photo ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
