import type { Car } from "@/lib/types";

/**
 * How long a freshly published car keeps its "just in" flag.
 *
 * Lifted out of CarCard so the listing card and the home page's showcase card
 * agree on what "just in" means. One definition, two presentations.
 */
export const JUST_IN_DAYS = 7;

/** True while a published car is inside its first week on the site. */
export function isJustIn(car: Pick<Car, "status" | "published_at">): boolean {
  if (car.status === "sold") return false;
  if (car.published_at == null) return false;
  return (
    Date.now() - new Date(car.published_at).getTime() <
    JUST_IN_DAYS * 24 * 60 * 60 * 1000
  );
}
