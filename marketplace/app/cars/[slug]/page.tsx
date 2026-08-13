import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowsLeftRight, Play } from "@phosphor-icons/react/dist/ssr";
import { fetchCarBySlug, fetchPublicCars } from "@/lib/cars";
import { getContent } from "@/lib/content";
import { parentUrl } from "@/lib/brand";
import { carTitle, formatDate, formatKm, formatPrice } from "@/lib/format";
import { estimateWeekly } from "@/lib/finance";
import { availabilityBadge } from "@/lib/car-flags";
import CarGallery from "@/components/CarGallery";
import TrustBlock from "@/components/TrustBlock";
import EnquiryForm from "@/components/EnquiryForm";
import InterestedButton from "@/components/InterestedButton";
import TestDriveForm from "@/components/TestDriveForm";
import MobileActionBar from "@/components/MobileActionBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import CarCard from "@/components/CarCard";
import SaveCompareButtons from "@/components/garage/SaveCompareButtons";
import RecentViewTracker from "@/components/garage/RecentViewTracker";
import { Reveal, CardReveal } from "@/components/motion/Reveal";

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
      ? `${title}: sold. See what else is in stock at Adam Hall Buy My Car.`
      : `${title} for ${formatPrice(car.price)}. ${formatKm(car.odometer_km)}, ${car.transmission}, ${car.fuel}. PPSR checked and honestly described.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: car.photos[0] ? [{ url: car.photos[0].url }] : [],
    },
  };
}

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default async function CarDetailPage({ params }: Props) {
  const { slug } = await params;
  const car = await fetchCarBySlug(slug);
  if (!car) notFound();

  const title = carTitle(car);
  const sold = car.status === "sold";
  // null when the car is sold or plainly available — the shared precedence
  // rule, so this page and the listing grid can never disagree.
  const availability = availabilityBadge(car);
  const video = car.video_url ? embedUrl(car.video_url) : null;
  // Sand carries the "just in" flag for a car's first week, as on the card.
  const justIn =
    !sold &&
    car.published_at != null &&
    Date.now() - new Date(car.published_at).getTime() < 7 * 24 * 60 * 60 * 1000;

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
      seller: { "@type": "AutoDealer", name: "Adam Hall Buy My Car" },
    },
  };

  const others = (await fetchPublicCars())
    .filter((c) => c.id !== car.id && c.status === "published")
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <RecentViewTracker carId={car.id} />

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-24 md:pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cars for sale", href: "/cars" },
              { label: title },
            ]}
          />
          <SaveCompareButtons carId={car.id} variant="detail" />
        </div>

        {/* Mockup layout: boxed gallery and facts on the left, the buying
            rail (name, price, trust, enquiry) on the right. On mobile the
            rail follows the gallery, so the price is never below the fold
            of the description. */}
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <CarGallery
              photos={car.photos}
              title={title}
              sold={sold}
              transitionName={`car-${car.id}`}
            />
          </div>

          <aside className="space-y-6 self-start lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <div>
              {/* Availability leads: "Reserved" changes what the buyer should
                  do, "Just in" only tells them how long it has been here.
                  availabilityBadge() returns null when the car is sold, so the
                  Sold treatment below is never doubled up on. */}
              {(availability || justIn) && (
                <div className="flex flex-wrap items-center gap-2">
                  {availability && (
                    <span className="type-label inline-block rounded-full bg-amber-soft px-3 py-1.5 text-[#8a5a1e]">
                      {availability}
                    </span>
                  )}
                  {justIn && (
                    <span className="type-label inline-block rounded-full bg-sand px-3 py-1.5 text-ink">
                      Just in
                    </span>
                  )}
                </div>
              )}
              <h1 className={`type-subheading ${availability || justIn ? "mt-3" : ""}`}>{title}</h1>
              {sold ? (
                <p className="type-price-lg mt-3 text-mute">Sold</p>
              ) : (
                <>
                  <p className="mt-3">
                    <span className="type-price-lg text-forest-700">
                      {formatPrice(car.price)}
                    </span>
                    <span className="ml-2 text-sm font-semibold text-stone-500">
                      drive away
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    Approx.{" "}
                    <strong className="tabular">
                      {formatPrice(estimateWeekly(car.price))}/week
                    </strong>{" "}
                    on finance ·{" "}
                    <Link
                      href={`/finance?price=${car.price}`}
                      className="font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-600"
                    >
                      estimate yours
                    </Link>
                  </p>
                </>
              )}
            </div>

            {/* The one action Adam wants, directly under the price. Save sits
                up beside the breadcrumb as a quiet bookmark; this is the
                active one and looks it. */}
            {!sold && <InterestedButton />}

            <TrustBlock car={car} showQuote={false} />
            {!sold && (
              <>
                <EnquiryForm carId={car.id} carName={title} />
                <TestDriveForm carId={car.id} carName={title} />
                <a
                  href={parentUrl("/buy-my-car", "marketplace-tradein")}
                  className="card p-5 flex items-center gap-4 hover:border-forest-200 hover:-translate-y-0.5 transition-[translate,border-color] duration-200 group"
                >
                  <ArrowsLeftRight size={26} className="text-forest-600 shrink-0" weight="bold" />
                  <div>
                    <p className="font-bold group-hover:text-forest-700 transition-colors duration-[120ms]">
                      Have a car to trade?
                    </p>
                    <p className="text-sm text-stone-600">
                      Send us yours and Adam will price both sides of the deal at once.
                    </p>
                  </div>
                </a>
              </>
            )}
          </aside>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            {sold && (
              <div className="card p-5 mb-8 bg-amber-soft !border-amber-accent/30">
                <p className="font-bold">
                  Sold {car.sold_at ? formatDate(car.sold_at) : ""}. This one found its owner.
                </p>
                <p className="text-sm text-stone-600 mt-1">
                  The cars below are still available, or jump on the watchlist
                  on the cars page and we&apos;ll tell you when the next one lands.
                </p>
              </div>
            )}

            <Reveal>
              <h2 className="type-subheading mb-3">The details</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-stone-200 rounded-2xl overflow-hidden">
                {specs.map(([k, v]) => (
                  <div key={k} className="bg-white p-4">
                    <dt className="text-xs font-semibold text-stone-500">{k}</dt>
                    <dd className="font-bold mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {/* The identity's section-transition device: the gauge at fine
                scale, once, separating the facts from the description. */}
            <div className="gauge-fine mt-10" aria-hidden="true" />

            {video && (
              <Reveal className="mt-10">
                <h2 className="type-subheading mb-3 flex items-center gap-2">
                  <Play size={20} weight="fill" className="text-forest-600" />
                  Walk-around with Adam
                </h2>
                <div className="aspect-video rounded-2xl overflow-hidden bg-ink">
                  <iframe
                    src={video}
                    title={`Walk-around video: ${title}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </Reveal>
            )}

            {car.description && (
              <Reveal className="mt-10">
                <h2 className="type-subheading mb-3">About this car</h2>
                <p className="text-stone-700 leading-relaxed whitespace-pre-line max-w-[68ch]">
                  {car.description}
                </p>
              </Reveal>
            )}

            {/* Adam's line on the car, as the mockup sets it: a dark card in
                the reading flow, the one voice on the page that is a person. */}
            {car.adams_take && (
              <Reveal className="mt-10">
                <figure className="rounded-2xl bg-forest-800 p-6 sm:p-8">
                  <blockquote className="type-lead text-white">
                    &ldquo;{car.adams_take}&rdquo;
                  </blockquote>
                  <figcaption className="type-label mt-4 text-white/70">
                    Adam Hall · 27 years in the trade
                  </figcaption>
                </figure>
              </Reveal>
            )}
          </div>
        </div>

        {others.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <h2 className="type-subheading mb-6">
                {sold ? "Still available" : "Also in stock"}
              </h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((c, i) => (
                <CardReveal key={c.id} index={i}>
                  <CarCard car={c} />
                </CardReveal>
              ))}
            </div>
          </section>
        )}
      </div>

      <MobileActionBar phoneHref={(await getContent()).phone.tel} carId={car.id} sold={sold} />
    </>
  );
}
