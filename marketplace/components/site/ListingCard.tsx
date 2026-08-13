import Image from "next/image";
import { Link } from "next-view-transitions";
import type { Car } from "@/lib/types";
import { carTitle, formatKm, formatPrice } from "@/lib/format";
import { availabilityBadge, isJustIn } from "@/lib/car-flags";
import SaveCompareButtons from "@/components/garage/SaveCompareButtons";

/**
 * Listing card for the redesigned cars grid (artifact frames 1c / 1d).
 *
 * Denser than the home page's StockCard: a shorter photograph, a title with
 * two lines reserved so prices line up across a row, and the save/compare
 * controls overlaid top-right. On a phone it turns into the artifact's
 * horizontal card — photo left, facts right — by CSS alone, so the markup and
 * the data are identical at every width.
 *
 * SaveCompareButtons is a sibling of the Link rather than a child: a button
 * inside an anchor is invalid and would swallow the card's own click.
 */
export default function ListingCard({
  car,
  priority = false,
  basePath = "/cars",
}: {
  car: Car;
  priority?: boolean;
  /** Lets the v2 pages keep their journey inside the v2 routes. */
  basePath?: string;
}) {
  const photo = car.photos[0];
  const sold = car.status === "sold";
  const justIn = isJustIn(car);
  const availability = availabilityBadge(car);

  return (
    <div className="mp2-lcard">
      <Link href={`${basePath}/${car.slug}`} className="mp2-lcard__link">
        <div
          className="mp2-lcard__media"
          style={{ viewTransitionName: `car-${car.id}` }}
        >
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.alt ?? carTitle(car)}
              fill
              priority={priority}
              sizes="(max-width: 639px) 40vw, (max-width: 1023px) 50vw, 33vw"
              className={`mp2-lcard__img${sold ? " is-sold" : ""}`}
            />
          ) : (
            <span className="mp2-lcard__nophoto">Photos coming</span>
          )}

          {/* One badge, most-important-first: sold, then availability (a
              reserved car matters more to a buyer than a new one), then
              just-in, then the PPSR reassurance as the resting state. */}
          {sold ? (
            <span className="mp2-lcard__badge mp2-lcard__badge--sold">SOLD</span>
          ) : availability ? (
            <span className="mp2-lcard__badge mp2-lcard__badge--status">
              {availability}
            </span>
          ) : justIn ? (
            <span className="mp2-lcard__badge mp2-lcard__badge--new">Just in</span>
          ) : car.ppsr_clear ? (
            <span className="mp2-lcard__badge">PPSR clear</span>
          ) : null}
        </div>

        <div className="mp2-lcard__body">
          <h3 className="mp2-lcard__title">{carTitle(car)}</h3>
          <p className={`mp2-lcard__price${sold ? " is-sold" : ""}`}>
            {sold ? "Sold" : formatPrice(car.price)}
          </p>
          <p className="mp2-lcard__spec">
            <span>{formatKm(car.odometer_km)}</span>
            <span>{car.transmission}</span>
            <span>{car.fuel}</span>
            <span>{car.body_type}</span>
          </p>
        </div>
      </Link>

      <SaveCompareButtons carId={car.id} variant="card" />
    </div>
  );
}
