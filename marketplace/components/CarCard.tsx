import Image from "next/image";
import { Link } from "next-view-transitions";
import type { Car } from "@/lib/types";
import { carTitle, formatKm, formatPrice } from "@/lib/format";
import { isJustIn } from "@/lib/car-flags";

// The card's entire motion vocabulary, per the identity (section 13):
// a 2px lift and a soft shadow at 200ms. The photograph is the graphic,
// so it does not zoom, pan or swap on hover.
//
// `block` is load-bearing: an <a> is inline by default, and while a grid
// blockifies its items, the home rail puts the card inside a plain slide
// div. Without it the white background paints around inline boxes only and
// the card reads as transparent over the hero's green band.

export default function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const photo = car.photos[0];
  const sold = car.status === "sold";
  // Sand carries the "just in" flag (identity section 04) for the first week.
  const justIn = isJustIn(car);

  return (
    <Link
      href={`/cars/${car.slug}`}
      className="block bg-card rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-stone-300/50 hover:-translate-y-0.5 transition-[translate,box-shadow] duration-200"
    >
      {/* Named so the photo morphs into the car-page hero on navigation. */}
      <div
        className="relative aspect-[3/2] bg-stone-200 overflow-hidden"
        style={{ viewTransitionName: `car-${car.id}` }}
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
        {sold && (
          <span className="absolute top-3 left-3 bg-amber-accent text-ink text-xs font-bold tracking-wide px-3 py-1.5 rounded-full">
            SOLD
          </span>
        )}
        {justIn && (
          <span className="type-label absolute top-3 left-3 rounded-full bg-sand px-3 py-1.5 text-ink">
            Just in
          </span>
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
