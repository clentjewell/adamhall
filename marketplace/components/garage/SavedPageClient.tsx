"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { Car } from "@/lib/types";
import { carTitle, formatPrice } from "@/lib/format";
import CarCard from "@/components/CarCard";
import { getRecent, getSaved, toggleSaved, onGarageChange } from "@/lib/garage";

export default function SavedPageClient() {
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const saved = getSaved();
      const recent = getRecent();
      setSavedIds(saved);
      setRecentIds(recent);

      const ids = [...new Set([...saved, ...recent])];
      if (ids.length === 0) {
        setCars([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = createClient();
      // RLS restricts anon reads to published + recently sold cars, so a
      // stale saved/recent id for a since-removed car just drops out here.
      const { data, error } = await supabase.from("cars").select("*").in("id", ids);
      if (cancelled) return;
      if (error) {
        console.error("SavedPageClient:", error.message);
        setCars([]);
      } else {
        setCars((data ?? []) as Car[]);
      }
      setLoading(false);
    }

    load();
    const unsubscribe = onGarageChange(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const savedCars = savedIds
    .map((id) => cars.find((c) => c.id === id))
    .filter((c): c is Car => Boolean(c));
  const recentCars = recentIds
    .map((id) => cars.find((c) => c.id === id))
    .filter((c): c is Car => Boolean(c));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-3xl mb-8">Saved cars</h1>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[3/2]" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : savedCars.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {savedCars.map((car) => (
            <div key={car.id} className="space-y-2">
              <CarCard car={car} />
              <button
                type="button"
                onClick={() => toggleSaved(car.id)}
                className="btn-ghost text-sm !py-1.5 w-full justify-center"
              >
                <X size={14} weight="bold" />
                Remove from saved
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <p className="font-display font-bold text-lg">
            Nothing saved yet. Tap the heart on any car.
          </p>
          <Link href="/cars" className="btn-primary mt-5 inline-flex">
            Browse cars
          </Link>
        </div>
      )}

      {(loading || recentCars.length > 0) && (
        <section className="mt-16">
          <h2 className="font-display font-bold text-xl mb-4">Recently viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-44 shrink-0 space-y-2">
                    <div className="skeleton aspect-[3/2] rounded-xl" />
                    <div className="skeleton h-4 w-3/4" />
                  </div>
                ))
              : recentCars.map((car) => (
                  <Link key={car.id} href={`/cars/${car.slug}`} className="w-44 shrink-0 group">
                    <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-stone-200">
                      {car.photos[0] ? (
                        <Image
                          src={car.photos[0].url}
                          alt={car.photos[0].alt ?? carTitle(car)}
                          fill
                          sizes="176px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-xs">
                          Photos coming
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink leading-snug line-clamp-1">
                      {carTitle(car)}
                    </p>
                    <p className="text-sm text-forest-700 font-bold">
                      {car.status === "sold" ? "Sold" : formatPrice(car.price)}
                    </p>
                  </Link>
                ))}
          </div>
        </section>
      )}
    </div>
  );
}
