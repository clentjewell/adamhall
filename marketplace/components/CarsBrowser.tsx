"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FunnelSimple, X } from "@phosphor-icons/react";
import type { Car } from "@/lib/types";
import { applyFilters, type CarFilters } from "@/lib/filters";
import CarCard from "@/components/CarCard";
import { CardReveal } from "@/components/motion/Reveal";

// Filters live in the URL so any filtered view is shareable; filtering
// itself is instant client-side over the server-fetched list.
function readFilters(sp: URLSearchParams): CarFilters {
  const num = (k: string) => {
    const v = Number(sp.get(k));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  return {
    make: sp.get("make") ?? undefined,
    model: sp.get("model") ?? undefined,
    yearMin: num("yearMin"),
    yearMax: num("yearMax"),
    priceMin: num("priceMin"),
    priceMax: num("priceMax"),
    body: sp.get("body") ?? undefined,
    transmission: sp.get("transmission") ?? undefined,
    fuel: sp.get("fuel") ?? undefined,
    kmMax: num("kmMax"),
    sort: (sp.get("sort") as CarFilters["sort"]) ?? undefined,
  };
}

export default function CarsBrowser({ cars }: { cars: Car[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(() => readFilters(new URLSearchParams(searchParams)), [searchParams]);

  const setFilter = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      // make change invalidates model choice
      if (key === "make") next.delete("model");
      startTransition(() => {
        router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  const clearAll = useCallback(() => {
    startTransition(() => router.replace(pathname, { scroll: false }));
  }, [router, pathname]);

  const makes = useMemo(() => [...new Set(cars.map((c) => c.make))].sort(), [cars]);
  const models = useMemo(
    () =>
      filters.make
        ? [...new Set(cars.filter((c) => c.make === filters.make).map((c) => c.model))].sort()
        : [],
    [cars, filters.make],
  );
  const bodies = useMemo(() => [...new Set(cars.map((c) => c.body_type))].sort(), [cars]);
  const fuels = useMemo(() => [...new Set(cars.map((c) => c.fuel))].sort(), [cars]);
  const transmissions = useMemo(
    () => [...new Set(cars.map((c) => c.transmission))].sort(),
    [cars],
  );

  const filtered = useMemo(() => applyFilters(cars, filters), [cars, filters]);
  const activeCount = Object.values(filters).filter(Boolean).length - (filters.sort ? 1 : 0);

  const select = (
    label: string,
    key: string,
    value: string | undefined,
    options: { value: string; label: string }[],
    anyLabel: string,
  ) => (
    <div>
      <label htmlFor={`f-${key}`} className="label">{label}</label>
      <select
        id={`f-${key}`}
        className="input"
        value={value ?? ""}
        onChange={(e) => setFilter(key, e.target.value)}
      >
        <option value="">{anyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);
  const priceSteps = [15000, 20000, 25000, 30000, 40000, 50000, 60000, 80000];
  const kmSteps = [40000, 60000, 80000, 100000, 120000, 150000];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="btn-secondary text-sm !py-2.5 lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
        >
          <FunnelSimple size={18} weight="bold" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <p className="text-sm text-stone-500">
          {filtered.length} car{filtered.length === 1 ? "" : "s"}
        </p>
        {activeCount > 0 && (
          <button onClick={clearAll} className="btn-ghost text-sm !py-1.5">
            <X size={14} weight="bold" />
            Clear filters
          </button>
        )}
        <div className="ml-auto">
          <label htmlFor="f-sort" className="sr-only">Sort</label>
          <select
            id="f-sort"
            className="input !w-auto text-sm"
            value={filters.sort ?? ""}
            onChange={(e) => setFilter("sort", e.target.value)}
          >
            <option value="">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="card p-5 space-y-4 lg:sticky lg:top-20">
            {select("Make", "make", filters.make, makes.map((m) => ({ value: m, label: m })), "Any make")}
            {filters.make &&
              select("Model", "model", filters.model, models.map((m) => ({ value: m, label: m })), "Any model")}
            {select("Body type", "body", filters.body, bodies.map((b) => ({ value: b, label: b })), "Any body")}
            <div className="grid grid-cols-2 gap-3">
              {select("Year from", "yearMin", filters.yearMin?.toString(), years.map((y) => ({ value: String(y), label: String(y) })), "Any")}
              {select("Year to", "yearMax", filters.yearMax?.toString(), years.map((y) => ({ value: String(y), label: String(y) })), "Any")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {select("Price from", "priceMin", filters.priceMin?.toString(), priceSteps.map((p) => ({ value: String(p), label: `$${(p / 1000).toFixed(0)}k` })), "Any")}
              {select("Price to", "priceMax", filters.priceMax?.toString(), priceSteps.map((p) => ({ value: String(p), label: `$${(p / 1000).toFixed(0)}k` })), "Any")}
            </div>
            {select("Odometer under", "kmMax", filters.kmMax?.toString(), kmSteps.map((k) => ({ value: String(k), label: `${(k / 1000).toFixed(0)},000 km` })), "Any kms")}
            {select("Transmission", "transmission", filters.transmission, transmissions.map((t) => ({ value: t, label: t })), "Any")}
            {select("Fuel", "fuel", filters.fuel, fuels.map((f) => ({ value: f, label: f })), "Any")}
          </div>
        </aside>

        <div>
          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((car, i) => (
                <CardReveal key={car.id} index={i}>
                  <CarCard car={car} priority={i < 3} />
                </CardReveal>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="font-display font-bold text-lg">Nothing matches those filters right now</p>
              <p className="text-stone-600 mt-2 max-w-[46ch] mx-auto">
                Stock turns over every week. Loosen a filter, or use the
                watchlist below and we&apos;ll email you the moment the right
                car lands.
              </p>
              <button onClick={clearAll} className="btn-secondary mt-5">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
