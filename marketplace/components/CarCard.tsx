import Image from "next/image";
import { Link } from "next-view-transitions";
import type { Car } from "@/lib/types";
import { carTitle, formatKm, formatPrice } from "@/lib/format";

// The card's entire motion vocabulary, per the identity (section 13):
// a 2px lift and a soft shadow at 200ms. The photograph is the graphic,
// so it does not zoom, pan or swap on hover.
export default function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const photo = car.photos[0];
  const sold = car.status === "sold";

  return (
    <Link
      href={`/cars/${car.slug}`}
      className="bg-card rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-stone-300/50 hover:-translate-y-0.5 transition-[translate,box-shadow] duration-200"
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
      </div>
      <div className="p-4">
        <h3 className="type-subheading text-ink group-hover:text-forest-700 transition-colors duration-[120ms]">
          {carTitle(car)}
        </h3>
        <p className="type-price mt-1.5 text-forest-700">
          {sold ? "Sold" : formatPrice(car.price)}
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {formatKm(car.odometer_km)} · {car.transmission} · {car.fuel} · {car.body_type}
        </p>
      </div>
    </Link>
  );
}
