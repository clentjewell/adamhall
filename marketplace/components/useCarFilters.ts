"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Car } from "@/lib/types";
import { applyFilters, type CarFilters } from "@/lib/filters";

/**
 * The cars page's filter state, lifted out of CarsBrowser so the existing
 * browser and the redesigned one cannot drift apart. One definition of what a
 * filter is and how it reaches the URL; two presentations of it.
 *
 * Filters live in the URL so any filtered view is shareable; filtering itself
 * is instant client-side over the server-fetched list.
 */
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

/** Option ladders offered in the selects. Fixed rather than derived so the
    steps stay round numbers regardless of what happens to be in stock. */
export const PRICE_STEPS = [15000, 20000, 25000, 30000, 40000, 50000, 60000, 80000];
export const KM_STEPS = [40000, 60000, 80000, 100000, 120000, 150000];

export interface FilterChip {
  key: string;
  label: string;
}

export function useCarFilters(cars: Car[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParams)),
    [searchParams],
  );

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

  // Each active filter as a removable chip, so what is narrowing the list is
  // visible and undoable without opening the panel.
  const chips = useMemo<FilterChip[]>(() => {
    const out: FilterChip[] = [];
    if (filters.make) out.push({ key: "make", label: filters.make });
    if (filters.model) out.push({ key: "model", label: filters.model });
    if (filters.body) out.push({ key: "body", label: filters.body });
    if (filters.transmission)
      out.push({ key: "transmission", label: filters.transmission });
    if (filters.fuel) out.push({ key: "fuel", label: filters.fuel });
    if (filters.yearMin) out.push({ key: "yearMin", label: `From ${filters.yearMin}` });
    if (filters.yearMax) out.push({ key: "yearMax", label: `To ${filters.yearMax}` });
    if (filters.priceMin)
      out.push({ key: "priceMin", label: `Over $${filters.priceMin.toLocaleString("en-AU")}` });
    if (filters.priceMax)
      out.push({ key: "priceMax", label: `Under $${filters.priceMax.toLocaleString("en-AU")}` });
    if (filters.kmMax)
      out.push({ key: "kmMax", label: `Under ${filters.kmMax.toLocaleString("en-AU")} km` });
    return out;
  }, [filters]);

  const years = useMemo(
    () => Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i),
    [],
  );

  return {
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
  };
}
