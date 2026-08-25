import type { Car, CarAvailability } from "@/lib/types";

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

/**
 * Buyer-facing wording for a car's availability. Sold is not in here: a sale
 * lives in `status`, and every caller checks that first.
 *
 * The wording avoids "reserved" as a promise. Adam takes no deposits and
 * holds nothing automatically, so the badge reports where the conversation is
 * up to, not a claim on the car.
 */
export const AVAILABILITY_LABELS: Record<CarAvailability, string | null> = {
  available: null,
  enquiry_in_progress: "Enquiry in progress",
  reserved: "Reserved",
};

/**
 * The one place the badge precedence rule lives, so the listing grid, the
 * showcase card and both detail pages cannot drift apart:
 *
 *   sold wins  →  else availability  →  else nothing.
 *
 * Returns null when the car should carry no availability badge. A sold car
 * returns null too: "Sold" is rendered by the existing sold treatment on each
 * surface, which this must not duplicate or override.
 */
export function availabilityBadge(
  car: Pick<Car, "status" | "availability">,
): string | null {
  if (car.status === "sold") return null;
  return AVAILABILITY_LABELS[car.availability] ?? null;
}
