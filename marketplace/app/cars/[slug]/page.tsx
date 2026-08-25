import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { fetchCarBySlug, fetchPublicCars } from "@/lib/cars";
import { getContent } from "@/lib/content";
import { carTitle, formatDate, formatKm, formatPrice } from "@/lib/format";
import { estimateWeekly } from "@/lib/finance";
import { availabilityBadge, isJustIn } from "@/lib/car-flags";
import CarGallery from "@/components/CarGallery";
import TrustBlock from "@/components/TrustBlock";
import MobileActionBar from "@/components/MobileActionBar";
import EnquiryForm from "@/components/EnquiryForm";
import InterestedButton from "@/components/InterestedButton";
import TestDriveForm from "@/components/TestDriveForm";
import ListingCard from "@/components/site/ListingCard";
import SaveCompareButtons from "@/components/garage/SaveCompareButtons";
import RecentViewTracker from "@/components/garage/RecentViewTracker";
import SiteReveal from "@/components/site/SiteReveal";

/**
 * The car page (route: /cars/[slug]), built to the "Carmarketplace UI
 * mockups" artifact, frames 1e (desktop) and 1f (mobile).
 *
 * A layout re-cut of app/cars/[slug]/page.tsx. Everything that does work is
 * reused as-is: the gallery, the trust block, both enquiry forms, the garage
 * buttons, the recent-view tracker, the mobile action bar and the Vehicle
 * JSON-LD. The artifact's "Ask a question / Book a look" toggle is not built
 * here — EnquiryForm already ships exactly that control.
 */
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await fetchCarBySlug(slug);
  if (!car) return { title: "Car not found" };
  const title = carTitle(car);
  const description =
    car.status === "sold"
      ? `${title}: sold. See what else is in stock at Car Marketplace.`
      : `${title} for ${formatPrice(car.price)}. ${formatKm(car.odometer_km)}, ${car.transmission}, ${car.fuel}. PPSR checked and honestly described.`;
  return {
    title,
    description,
  };
}

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default async function Car2DetailPage({ params }: Props) {
  const { slug } = await params;
  const car = await fetchCarBySlug(slug);
  if (!car) notFound();

  const title = carTitle(car);
  const sold = car.status === "sold";
  const video = car.video_url ? embedUrl(car.video_url) : null;
  const justIn = isJustIn(car);
  const availability = availabilityBadge(car);

  const specs: [string, string][] = [
    ["Year", String(car.year)],
    ["Odometer", formatKm(car.odometer_km)],
    ["Body", car.body_type],
    ["Transmission", car.transmission],
    ["Fuel", car.fuel],
    ...(car.drivetrain ? ([["Drivetrain", car.drivetrain]] as [string, string][]) : []),
    ...(car.colour ? ([["Colour", car.colour]] as [string, string][]) : []),
    ...(car.seats ? ([["Seats", String(car.seats)]] as [string, string][]) : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: title,
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleModelDate: String(car.year),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.odometer_km,
      unitCode: "KMT",
    },
    bodyType: car.body_type,
    vehicleTransmission: car.transmission,
    fuelType: car.fuel,
    color: car.colour ?? undefined,
    image: car.photos.map((p) => p.url),
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "AUD",
      availability: sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: "Car Marketplace" },
    },
  };

  const others = (await fetchPublicCars())
    .filter((c) => c.id !== car.id && c.status === "published")
    .slice(0, 3);

  return (
    <div className="ah-site mp-car2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteReveal />
      <RecentViewTracker carId={car.id} />

      <div className="container container--wide mp2-car__back">
        <Link href="/" className="mp2-backlink">
          &larr; All cars
        </Link>
      </div>

      <div className="container container--wide mp2-car">
        {/* Left: the photographs and everything you read. */}
        <div className="mp2-car__main">
          <div className="mp2-car__gallery">
            <CarGallery
              photos={car.photos}
              title={title}
              sold={sold}
              transitionName={`car-${car.id}`}
            />
          </div>

          {sold && (
            <div className="mp2-car__soldnote">
              <p className="mp2-car__soldnote-title">
                Sold {car.sold_at ? formatDate(car.sold_at) : ""}. This one
                found its owner.
              </p>
              <p>
                The cars below are still available, or jump on the watchlist on
                the cars page and we&apos;ll tell you when the next one lands.
              </p>
            </div>
          )}

          <h2 className="mp2-car__h2">The details</h2>
          <dl className="mp2-specs">
            {specs.map(([k, v]) => (
              <div key={k} className="mp2-specs__cell">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          {video && (
            <>
              <h2 className="mp2-car__h2">Walk-around video</h2>
              <div className="mp2-car__video">
                <iframe
                  src={video}
                  title={`Walk-around video: ${title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </>
          )}

          {car.description && (
            <>
              <h2 className="mp2-car__h2">About this car</h2>
              <p className="mp2-car__body">{car.description}</p>
            </>
          )}

          {/* Our line on the car: the one voice on the page that reads as a
              person, set as the artifact's dark card. */}
          {car.adams_take && (
            <figure className="mp2-take">
              <blockquote>&ldquo;{car.adams_take}&rdquo;</blockquote>
              <figcaption>Our take, twenty-seven years in the trade</figcaption>
            </figure>
          )}
        </div>

        {/* Right: the buying rail. */}
        <aside className="mp2-rail">
          <div>
            {/* Availability first: it changes what the buyer should do.
                availabilityBadge() returns null on a sold car, so the Sold
                price treatment below is never doubled up on. */}
            {(availability || justIn) && (
              <div className="mp2-rail__flags">
                {availability && (
                  <span className="mp2-rail__flag is-status">{availability}</span>
                )}
                {justIn && <span className="mp2-rail__flag">Just in</span>}
              </div>
            )}
            <h1 className="mp2-rail__title">{title}</h1>
            {sold ? (
              <p className="mp2-rail__price is-sold">Sold</p>
            ) : (
              <>
                <div className="mp2-rail__pricerow">
                  <p className="mp2-rail__price">{formatPrice(car.price)}</p>
                  <p className="mp2-rail__qualifier">drive away</p>
                </div>
                <p className="mp2-rail__finance">
                  Approx.{" "}
                  <strong className="tabular">
                    {formatPrice(estimateWeekly(car.price))}/week
                  </strong>{" "}
                  on finance &middot;{" "}
                  <Link href={`/finance?price=${car.price}`}>estimate yours</Link>
                </p>
              </>
            )}
          </div>

          {/* The active CTA, directly under the price. Save/Compare sit above
              the gallery as quiet bookmarks; this is the one we want taken. */}
          {!sold && <InterestedButton className="btn btn--tan mp2-rail__interested" />}

          <div className="mp2-rail__trust">
            <TrustBlock car={car} showQuote={false} />
          </div>

          {!sold && (
            <>
              {/* EnquiryForm already carries the artifact's own
                  "Ask a question / Book a look" toggle — it switches the
                  `kind` on a single server action — so it is used directly
                  rather than wrapped in a second set of tabs.
                  TestDriveForm stays as its own card: booking a specific
                  viewing window is a different job from sending a question,
                  and the artifact simply did not draw it. */}
              <div className="mp2-rail__form">
                <EnquiryForm carId={car.id} carName={title} />
              </div>
              <div className="mp2-rail__form">
                <TestDriveForm carId={car.id} carName={title} />
              </div>
              <Link href="/car-valuations" className="mp2-rail__trade">
                Selling yours? Get an instant range.
              </Link>
            </>
          )}

          <div className="mp2-rail__garage">
            <SaveCompareButtons carId={car.id} variant="detail" />
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mp2-also">
          <div className="container container--wide">
            <h2 className="mp2-also__title">
              {sold ? "Still available" : "Also in stock"}
            </h2>
            <div className="mp2-also__grid">
              {others.map((c) => (
                <ListingCard key={c.id} car={c} basePath="/cars" />
              ))}
            </div>
          </div>
        </section>
      )}

      <MobileActionBar
        phoneHref={(await getContent()).phone.tel}
        carId={car.id}
        sold={sold}
      />
    </div>
  );
}
