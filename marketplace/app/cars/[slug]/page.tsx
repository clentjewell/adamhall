import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowsLeftRight, Play } from "@phosphor-icons/react/dist/ssr";
import { fetchCarBySlug, fetchPublicCars } from "@/lib/cars";
import { carTitle, formatDate, formatKm, formatPrice } from "@/lib/format";
import Gallery from "@/components/Gallery";
import TrustBlock from "@/components/TrustBlock";
import EnquiryForm from "@/components/EnquiryForm";
import CarCard from "@/components/CarCard";

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
      ? `${title} — sold. See what else is in stock at Adam Hall Buy My Car.`
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
  const video = car.video_url ? embedUrl(car.video_url) : null;

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/cars" className="btn-ghost text-sm -ml-3 mb-4">
        <ArrowLeft size={16} weight="bold" />
        All cars
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <Gallery photos={car.photos} title={title} />

          {video && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
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
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display font-bold text-xl mb-3">The details</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-stone-200 rounded-2xl overflow-hidden">
              {specs.map(([k, v]) => (
                <div key={k} className="bg-white p-4">
                  <dt className="text-xs font-semibold text-stone-500">{k}</dt>
                  <dd className="font-bold mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {car.description && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-xl mb-3">About this car</h2>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line max-w-[68ch]">
                {car.description}
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 self-start">
          <div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight leading-tight">
              {title}
            </h1>
            {sold ? (
              <div className="mt-3">
                <span className="inline-block bg-amber-accent text-white font-bold px-4 py-1.5 rounded-full">
                  SOLD {car.sold_at ? formatDate(car.sold_at) : ""}
                </span>
                <p className="text-stone-600 mt-3 text-sm">
                  This one found its owner. The cars below are still available,
                  or jump on the watchlist and we&apos;ll tell you when the next
                  one lands.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-3xl font-extrabold text-forest-700">
                {formatPrice(car.price)}
                <span className="text-sm font-semibold text-stone-500 ml-2">drive away</span>
              </p>
            )}
          </div>

          <TrustBlock car={car} />

          {!sold && (
            <>
              <EnquiryForm carId={car.id} carName={title} />
              <Link
                href={`/sell?trade=${car.slug}`}
                className="card p-5 flex items-center gap-4 hover:border-forest-200 transition-colors group"
              >
                <ArrowsLeftRight size={26} className="text-forest-600 shrink-0" weight="bold" />
                <div>
                  <p className="font-bold group-hover:text-forest-700 transition-colors">
                    Have a car to trade?
                  </p>
                  <p className="text-sm text-stone-600">
                    Send us yours and Adam will price both sides of the deal at once.
                  </p>
                </div>
              </Link>
            </>
          )}
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display font-bold text-2xl mb-6">
            {sold ? "Still available" : "Also in stock"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
