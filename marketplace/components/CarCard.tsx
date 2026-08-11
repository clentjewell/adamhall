"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Car } from "@/lib/types";
import { carTitle, formatKm, formatPrice } from "@/lib/format";

export default function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const photo = car.photos[0];
  const secondPhoto = car.photos[1];
  const sold = car.status === "sold";
  // The second angle only mounts once the card is first hovered or focused,
  // so a grid of cards never downloads two photos per car up front.
  const [peek, setPeek] = useState(false);

  return (
    <Link
      href={`/cars/${car.slug}`}
      onMouseEnter={() => setPeek(true)}
      onFocus={() => setPeek(true)}
      className="bg-card rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-stone-300/50 hover:-translate-y-1 transition-[translate,box-shadow] duration-300"
    >
      <div className="relative aspect-[3/2] bg-stone-200 overflow-hidden">
        {photo ? (
          <>
            <Image
              src={photo.url}
              alt={photo.alt ?? carTitle(car)}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover group-hover:scale-[1.03] transition-transform duration-500 ${sold ? "opacity-80" : ""}`}
            />
            {peek && secondPhoto && !sold && (
              <Image
                src={secondPhoto.url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-[opacity,scale] duration-500"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm">
            Photos coming
          </div>
        )}
        {sold && (
          <span className="absolute top-3 left-3 bg-amber-accent text-ink text-xs font-bold tracking-wide px-3 py-1.5 rounded-full">
            SOLD
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-xl leading-snug text-ink group-hover:text-forest-700 transition-colors">
          {carTitle(car)}
        </h3>
        <p className="mt-1 text-xl font-extrabold text-forest-700">
          {sold ? "Sold" : formatPrice(car.price)}
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {formatKm(car.odometer_km)} · {car.transmission} · {car.fuel} · {car.body_type}
        </p>
      </div>
    </Link>
  );
}
