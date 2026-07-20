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

export function applyFilters(cars: Car[], f: CarFilters): Car[] {
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
