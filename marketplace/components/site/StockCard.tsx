import Image from "next/image";
import { Link } from "next-view-transitions";
import type { Car } from "@/lib/types";
import { carTitle, formatKm, formatPrice } from "@/lib/format";
import { isJustIn } from "@/lib/car-flags";

/**
 * Showcase listing card for the redesigned home page.
 *
 * Same data, same destination and the same shared-element transition as
 * CarCard — this is a second presentation of a listing, not a second source of
 * truth. It differs from CarCard only in layout: a wider photograph, the price
 * and its "drive away" qualifier sharing a baseline, and the spec line pushed
 * below a hairline rule so the three cards read as a row of matched objects.
 *
 * Colour stays where the identity puts it: sand carries "just in", amber is
 * status-only for SOLD, and the price sits in deep forest exactly as it does
 * on the listing card and the car page.
 */
export default function StockCard({
  car,
  priority = false,
}: {
  car: Car;
  priority?: boolean;
}) {
  const photo = car.photos[0];
  const sold = car.status === "sold";
  const justIn = isJustIn(car);

  return (
    <Link href={`/cars/${car.slug}`} className="mp2-card">
      {/* Named so the photo morphs into the car-page hero on navigation. */}
      <div
        className="mp2-card__media"
        style={{ viewTransitionName: `car-${car.id}` }}
      >
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt ?? carTitle(car)}
            fill
            priority={priority}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className={`mp2-card__img${sold ? " is-sold" : ""}`}
          />
        ) : (
          <span className="mp2-card__nophoto">Photos coming</span>
        )}

        {sold ? (
          <span className="mp2-card__badge mp2-card__badge--sold">SOLD</span>
        ) : justIn ? (
          <span className="mp2-card__badge mp2-card__badge--new">Just in</span>
        ) : car.ppsr_clear ? (
          <span className="mp2-card__badge">PPSR clear</span>
        ) : null}
      </div>

      <div className="mp2-card__body">
        <h3 className="mp2-card__title">{carTitle(car)}</h3>

        <div className="mp2-card__pricerow">
          <p className={`mp2-card__price${sold ? " is-sold" : ""}`}>
            {sold ? "Sold" : formatPrice(car.price)}
          </p>
          {!sold && <p className="mp2-card__qualifier">drive away</p>}
        </div>

        <p className="mp2-card__spec">
          <span>{formatKm(car.odometer_km)}</span>
          <span>{car.transmission}</span>
          <span>{car.fuel}</span>
          <span>{car.body_type}</span>
        </p>
      </div>
    </Link>
  );
}
