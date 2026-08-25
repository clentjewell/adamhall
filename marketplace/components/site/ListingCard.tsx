import Image from "next/image";
import { Link } from "next-view-transitions";
import type { Car } from "@/lib/types";
import { carTitle, formatKm, formatPrice } from "@/lib/format";
import { availabilityBadge, isJustIn } from "@/lib/car-flags";
import SaveCompareButtons from "@/components/garage/SaveCompareButtons";
import MetaIcon from "@/components/site/MetaIcon";
import TypeIcon from "@/components/site/TypeIcon";

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
              just-in. The PPSR flag came off the photographs at Adam's
              direction — every car is checked, so a badge saying so on each
              card was furniture. The car's own page still states it. */}
          {sold ? (
            <span className="mp2-lcard__badge mp2-lcard__badge--sold">SOLD</span>
          ) : availability ? (
            <span className="mp2-lcard__badge mp2-lcard__badge--status">
              {availability}
            </span>
          ) : justIn ? (
            <span className="mp2-lcard__badge mp2-lcard__badge--new">Just in</span>
          ) : null}
        </div>

        <div className="mp2-lcard__body">
          <h3 className="mp2-lcard__title">{carTitle(car)}</h3>
          <p className={`mp2-lcard__price${sold ? " is-sold" : ""}`}>
            {sold ? "Sold" : formatPrice(car.price)}
          </p>
          {/* Each fact carries its glyph: the body and fuel are the same
              drawings the hero band's tiles use, so the card and the search
              speak one icon vocabulary; the gauge and the shift gate are
              their meta-row cousins (MetaIcon). The glyphs replace the dot
              separators — two kinds of punctuation in one row is one too
              many. */}
          <p className="mp2-lcard__spec">
            <span>
              <MetaIcon kind="odometer" className="mp2-lcard__glyph" />
              {formatKm(car.odometer_km)}
            </span>
            <span>
              <MetaIcon kind="transmission" className="mp2-lcard__glyph" />
              {car.transmission}
            </span>
            <span>
              <TypeIcon value={car.fuel} className="mp2-lcard__glyph" />
              {car.fuel}
            </span>
            <span>
              <TypeIcon value={car.body_type} className="mp2-lcard__glyph" />
              {car.body_type}
            </span>
          </p>
        </div>
      </Link>

      <SaveCompareButtons carId={car.id} variant="card" />
    </div>
  );
}
