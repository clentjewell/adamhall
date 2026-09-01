import Image from "next/image";
import { Link } from "next-view-transitions";
import type { Car } from "@/lib/types";
import { carTitle, formatKm, formatPrice } from "@/lib/format";
import { availabilityBadge, isJustIn } from "@/lib/car-flags";

// The card's entire motion vocabulary, per the identity (section 13):
// a 2px lift and a soft shadow at 200ms. The photograph is the graphic,
// so it does not zoom, pan or swap on hover.
//
// `block` is load-bearing: an <a> is inline by default, and while a grid
// blockifies its items, the home rail puts the card inside a plain slide
// div. Without it the white background paints around inline boxes only and
// the card reads as transparent over the hero's green band.

export default function CarCard({
  car,
  priority = false,
  duplicate = false,
}: {
  car: Car;
  priority?: boolean;
  /** Set on the cloned half of a looping rail. A view-transition-name has
      to be unique in the document, so a clone carrying the same one would
      break the card-to-hero morph for the original. */
  duplicate?: boolean;
}) {
  const photo = car.photos[0];
  const sold = car.status === "sold";
  // Sand carries the "just in" flag (identity section 04) for the first week.
  const justIn = isJustIn(car);
  // Null when sold or plainly available — sold wins, and is rendered below.
  const availability = availabilityBadge(car);

  return (
    <Link
      href={`/cars/${car.slug}`}
      className="block bg-card rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-stone-300/50 hover:-translate-y-0.5 transition-[translate,box-shadow] duration-200"
    >
      {/* Named so the photo morphs into the car-page hero on navigation. */}
      <div
        className="relative aspect-[3/2] bg-stone-200 overflow-hidden"
        style={duplicate ? undefined : { viewTransitionName: `car-${car.id}` }}
      >
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt ?? carTitle(car)}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover ${sold ? "opacity-80" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm">
            Photos coming
          </div>
        )}
        {/* One positioned row, because a car can be both "just in" and
            reserved. Sold and availability are mutually exclusive by the
            precedence rule in availabilityBadge(), and isJustIn() is already
            false for a sold car, so SOLD always stands alone. */}
        {(sold || availability || justIn) && (
          <div
            /* Stops short of the save/compare buttons in the top-right corner
               and wraps instead of running underneath them. */
            className="absolute top-3 left-3 right-[5.25rem] flex flex-wrap items-center gap-1.5"
          >
            {sold && (
              <span className="bg-amber-accent text-ink text-xs font-bold tracking-wide px-3 py-1.5 rounded-full">
                SOLD
              </span>
            )}
            {availability && (
              <span className="type-label rounded-full bg-amber-soft px-3 py-1.5 text-ink">
                {availability}
              </span>
            )}
            {justIn && (
              <span className="type-label rounded-full bg-sand px-3 py-1.5 text-ink">
                Just in
              </span>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        {/* Two lines reserved from the point there is a second column to
            line up against, so price and specs share a baseline across a row
            instead of stepping down under a longer name. */}
        <h3 className="type-card-title text-ink transition-colors duration-[120ms] group-hover:text-forest-700 sm:min-h-[3.125rem]">
          {carTitle(car)}
        </h3>
        <p className="type-card-price mt-1 text-forest-700">
          {sold ? "Sold" : formatPrice(car.price)}
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {formatKm(car.odometer_km)} · {car.transmission} · {car.fuel} · {car.body_type}
        </p>
      </div>
    </Link>
  );
}
