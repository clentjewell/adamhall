"use client";

import { useState } from "react";
import { FunnelSimple, X } from "@phosphor-icons/react";
import type { Car } from "@/lib/types";
import CarCard from "@/components/CarCard";
import SaveCompareButtons from "@/components/garage/SaveCompareButtons";
import { CardReveal } from "@/components/motion/Reveal";
import { useCarFilters, PRICE_STEPS, KM_STEPS } from "@/components/useCarFilters";

export default function CarsBrowser({
  cars,
  watchPanel,
}: {
  cars: Car[];
  /** "Nothing that fits? Set a watch." Passed in so the server page keeps
      ownership of the form. Rendered under the results rather than in the
      filter rail: the rail is 260px, which truncated every field, and the
      filter card above it is sticky, so once the page scrolled it painted
      over the top half of the form. Under the results is also where the
      empty state has always pointed ("use the watchlist below"). */
  watchPanel?: React.ReactNode;
}) {
  const [showFilters, setShowFilters] = useState(false);
  // Filters live in the URL and are shared with the redesigned browser —
  // see components/useCarFilters.ts.
  const {
    filters,
    setFilter,
    clearAll,
    filtered,
    activeCount,
    chips,
    makes,
    models,
    bodies,
    fuels,
    transmissions,
    years,
  } = useCarFilters(cars);

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
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key, "")}
            className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-3 py-1.5 text-sm font-semibold text-forest-700 hover:border-forest-600"
            aria-label={`Remove filter: ${chip.label}`}
          >
            {chip.label}
            <X size={12} weight="bold" />
          </button>
        ))}
        {activeCount > 0 && (
          <button onClick={clearAll} className="btn-ghost text-sm !py-1.5">
            <X size={14} weight="bold" />
            Clear all
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
              {select("Price from", "priceMin", filters.priceMin?.toString(), PRICE_STEPS.map((p) => ({ value: String(p), label: `$${p.toLocaleString("en-AU")}` })), "Any")}
              {select("Price to", "priceMax", filters.priceMax?.toString(), PRICE_STEPS.map((p) => ({ value: String(p), label: `$${p.toLocaleString("en-AU")}` })), "Any")}
            </div>
            {select("Odometer under", "kmMax", filters.kmMax?.toString(), KM_STEPS.map((k) => ({ value: String(k), label: `${(k / 1000).toFixed(0)},000 km` })), "Any kms")}
            {select("Transmission", "transmission", filters.transmission, transmissions.map((t) => ({ value: t, label: t })), "Any")}
            {select("Fuel", "fuel", filters.fuel, fuels.map((f) => ({ value: f, label: f })), "Any")}
          </div>
        </aside>

        <div>
          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((car, i) => (
                <CardReveal key={car.id} index={i}>
                  <div className="relative">
                    <CarCard car={car} priority={i < 3} />
                    <SaveCompareButtons carId={car.id} variant="card" />
                  </div>
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
          {watchPanel && <div className="mt-8">{watchPanel}</div>}
        </div>
      </div>
    </div>
  );
}
