import type { Car } from "@/lib/types";

// Pure filtering — shared by the client-side browser and any server code.
export interface CarFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  body?: string;
  transmission?: string;
  fuel?: string;
  kmMax?: number;
  sort?: "newest" | "price-asc" | "price-desc";
}

/**
 * The fields filtering actually reads. Named so callers can pass a projection
 * rather than whole cars: the hero's search panel runs this in the browser
 * over every published car, and shipping the descriptions and photo lists to
 * do it would put the whole catalogue in the page's payload for the sake of
 * eight numbers. A full Car satisfies this, so every existing caller is
 * unchanged.
 */
export type Filterable = Pick<
  Car,
  | "make"
  | "model"
  | "year"
  | "price"
  | "body_type"
  | "transmission"
  | "fuel"
  | "odometer_km"
>;

export function applyFilters<T extends Filterable>(cars: T[], f: CarFilters): T[] {
  let out = cars.filter((c) => {
    if (f.make && c.make !== f.make) return false;
    if (f.model && c.model !== f.model) return false;
    if (f.yearMin && c.year < f.yearMin) return false;
    if (f.yearMax && c.year > f.yearMax) return false;
    if (f.priceMin && c.price < f.priceMin) return false;
    if (f.priceMax && c.price > f.priceMax) return false;
    if (f.body && c.body_type !== f.body) return false;
    if (f.transmission && c.transmission !== f.transmission) return false;
    if (f.fuel && c.fuel !== f.fuel) return false;
    if (f.kmMax && c.odometer_km > f.kmMax) return false;
    return true;
  });
  if (f.sort === "price-asc") out = out.toSorted((a, b) => a.price - b.price);
  else if (f.sort === "price-desc") out = out.toSorted((a, b) => b.price - a.price);
  return out;
}
