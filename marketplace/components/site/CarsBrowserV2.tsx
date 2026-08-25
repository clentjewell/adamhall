"use client";

import { useState, type ReactNode } from "react";
import type { Car } from "@/lib/types";
import ListingCard from "@/components/site/ListingCard";
import { useCarFilters, PRICE_STEPS, KM_STEPS } from "@/components/useCarFilters";

/**
 * Redesigned cars browser (artifact frames 1c / 1d).
 *
 * Purely a second presentation: every piece of state comes from
 * useCarFilters, the same hook the existing CarsBrowser uses, so filters stay
 * in the URL and stay shareable. What changes is the arrangement — a sticky
 * bar carrying the active chips and the sort, a narrower sidebar of selects,
 * and a denser grid.
 */
export default function CarsBrowserV2({
  cars,
  watchPanel,
  basePath = "/cars",
}: {
  cars: Car[];
  /** The watchlist form, passed in so the server page keeps ownership of it. */
  watchPanel?: ReactNode;
  basePath?: string;
}) {
  const [showFilters, setShowFilters] = useState(false);
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

  // Sold cars stay up for three months, because seeing what actually moved is
  // part of the pitch. The window is set in the database, not here — see
  // migration 0004, which has to move the RLS policy and the nightly archive
  // job together. They do not belong in the same grid as the cars you can buy:
  // mixed in, every third card is a dead end for someone shopping.
  const forSale = filtered.filter((c) => c.status !== "sold");
  const sold = filtered.filter((c) => c.status === "sold");

  const select = (
    label: string,
    key: string,
    value: string | undefined,
    options: { value: string; label: string }[],
    anyLabel: string,
  ) => (
    <div className="mp2-field">
      <label htmlFor={`f2-${key}`} className="mp2-field__label">
        {label}
      </label>
      <select
        id={`f2-${key}`}
        className="mp2-select"
        value={value ?? ""}
        onChange={(e) => setFilter(key, e.target.value)}
      >
        <option value="">{anyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const sortSelect = (
    <>
      <label htmlFor="f2-sort" className="mp2-sort__label">
        Sort
      </label>
      <select
        id="f2-sort"
        className="mp2-select mp2-select--auto"
        value={filters.sort ?? ""}
        onChange={(e) => setFilter("sort", e.target.value)}
      >
        <option value="">Newest first</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </>
  );

  return (
    <div className="mp2-cars">
      {/* Sticky bar: what is currently narrowing the list, and the sort.
          Sits under the 64px header so it never covers the results. */}
      <div className="mp2-filterbar">
        <div className="container container--wide mp2-filterbar__inner">
          <button
            type="button"
            className="mp2-filterbar__toggle"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="mp2-filter-panel"
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>

          <p className="mp2-filterbar__count">
            {forSale.length} car{forSale.length === 1 ? "" : "s"} for sale
            {sold.length > 0 ? `, ${sold.length} recently sold` : ""}
          </p>

          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key, "")}
              className="mp2-chip mp2-chip--on"
              aria-label={`Remove filter: ${chip.label}`}
            >
              {chip.label}
              <span aria-hidden="true">✕</span>
            </button>
          ))}

          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className="mp2-clear">
              Clear all
            </button>
          )}

          <div className="mp2-sort">{sortSelect}</div>
        </div>
      </div>

      <div className="container container--wide mp2-cars__layout">
        <aside
          id="mp2-filter-panel"
          className={`mp2-sidebar${showFilters ? " is-open" : ""}`}
        >
          <div className="mp2-sidebar__card">
            <p className="mp2-sidebar__title">Filters</p>
            <div className="mp2-sidebar__fields">
              {select("Make", "make", filters.make, makes.map((m) => ({ value: m, label: m })), "Any make")}
              {filters.make &&
                select("Model", "model", filters.model, models.map((m) => ({ value: m, label: m })), "Any model")}
              {select("Body type", "body", filters.body, bodies.map((b) => ({ value: b, label: b })), "Any body")}
              <div className="mp2-field-pair">
                {select("Year from", "yearMin", filters.yearMin?.toString(), years.map((y) => ({ value: String(y), label: String(y) })), "Any")}
                {select("Year to", "yearMax", filters.yearMax?.toString(), years.map((y) => ({ value: String(y), label: String(y) })), "Any")}
              </div>
              <div className="mp2-field-pair">
                {select("Price from", "priceMin", filters.priceMin?.toString(), PRICE_STEPS.map((p) => ({ value: String(p), label: `$${p.toLocaleString("en-AU")}` })), "Any")}
                {select("Price to", "priceMax", filters.priceMax?.toString(), PRICE_STEPS.map((p) => ({ value: String(p), label: `$${p.toLocaleString("en-AU")}` })), "Any")}
              </div>
              {select("Odometer under", "kmMax", filters.kmMax?.toString(), KM_STEPS.map((k) => ({ value: String(k), label: `${(k / 1000).toFixed(0)},000 km` })), "Any kms")}
              {select("Transmission", "transmission", filters.transmission, transmissions.map((t) => ({ value: t, label: t })), "Any")}
              {select("Fuel", "fuel", filters.fuel, fuels.map((f) => ({ value: f, label: f })), "Any")}
            </div>
            <p className="mp2-sidebar__note">
              Nothing that fits? Set a watch below and we&rsquo;ll email you
              when one lands.
            </p>
          </div>
        </aside>

        <div className="mp2-cars__results">
          {forSale.length > 0 ? (
            <div className="mp2-grid">
              {forSale.map((car, i) => (
                <ListingCard
                  key={car.id}
                  car={car}
                  priority={i < 3}
                  basePath={basePath}
                />
              ))}
            </div>
          ) : (
            <div className="mp2-empty">
              <p className="mp2-empty__title">
                No cars for sale match those filters
              </p>
              <p className="mp2-empty__body">
                Stock turns over every week. Loosen a filter, or use the
                watchlist below and we&apos;ll email you the moment the right
                car lands.
              </p>
              <button type="button" onClick={clearAll} className="btn btn--outline-green">
                Clear filters
              </button>
            </div>
          )}

          {sold.length > 0 && (
            <section className="mp2-sold">
              <h2 className="mp2-sold__title">Recently sold</h2>
              <p className="mp2-sold__sub">
                These have gone. They stay up for three months so you can see
                what moves and what it went for.
              </p>
              <div className="mp2-grid mp2-grid--sold">
                {sold.map((car) => (
                  <ListingCard key={car.id} car={car} basePath={basePath} />
                ))}
              </div>
            </section>
          )}

          {watchPanel && <div className="mp2-watch">{watchPanel}</div>}
        </div>
      </div>
    </div>
  );
}
