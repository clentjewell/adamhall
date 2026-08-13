import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Lightning, Star } from "@phosphor-icons/react/dist/ssr";
import { fetchCarBySlug } from "@/lib/cars";
import { getResponseStat } from "@/lib/stats";
import { carTitle } from "@/lib/format";
import { getContent } from "@/lib/content";
import { pageHeroImages, pageHeroVideos } from "@/lib/heroes";
import SellFlow, { type Draft } from "@/components/sell/SellFlow";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  // The seller intake engine, not a buy-side page. Reachable from the
  // trade-in bridge on any car page, off the nav, out of the index.
  robots: { index: false, follow: true },
  title: "Sell your car",
  description:
    "Sell your car to Adam Hall in about five minutes. Rego, a few photos, done. Adam personally reviews every car and makes a real offer within 1 business day.",
};

interface Props {
  searchParams: Promise<{
    trade?: string;
    make?: string;
    model?: string;
    year?: string;
    km?: string;
    service?: string;
    accidents?: string;
    suburb?: string;
  }>;
}

const SERVICE_VALUES = ["full", "partial", "none", "unknown"];

/**
 * Sellers arriving from the instant valuation tool have already told us the
 * car, so carry it across rather than asking twice. Everything is validated
 * here because it arrives in a URL anyone can edit.
 */
function prefillFromQuery(
  q: Awaited<Props["searchParams"]>,
): Partial<Draft> | undefined {
  if (!q.make && !q.model) return undefined;

  const year = Number(q.year);
  const km = Number(q.km);
  const thisYear = new Date().getFullYear();

  return {
    // The tool collects make and model, never a rego, so open on the manual
    // path with those filled rather than an empty rego field.
    manual: true,
    make: (q.make ?? "").slice(0, 40),
    model: (q.model ?? "").slice(0, 60),
    year:
      Number.isInteger(year) && year >= 1990 && year <= thisYear + 1
        ? String(year)
        : "",
    odometer_km:
      Number.isInteger(km) && km >= 0 && km <= 500_000 ? String(km) : "",
    service_history: SERVICE_VALUES.includes(q.service ?? "") ? q.service! : "",
    had_accidents: q.accidents === "yes" ? "yes" : q.accidents === "no" ? "no" : "",
    suburb: (q.suburb ?? "").slice(0, 80),
  };
}

export default async function SellPage({ searchParams }: Props) {
  const query = await searchParams;
  const { trade } = query;
  const [stat, tradeCar, content] = await Promise.all([
    getResponseStat(),
    trade ? fetchCarBySlug(trade) : Promise.resolve(null),
    getContent(),
  ]);
  const prefill = prefillFromQuery(query);

  return (
    <>
      <PageHero
        image={pageHeroImages.sell}
        video={pageHeroVideos.sell}
        imageAlt="Adam checking over a car's engine"
        title={content.sellHero.title}
        titleEditPath="sellHero.title"
      >
        <div>
          <p data-edit="sellHero.sub" className="text-stone-200 max-w-[52ch] type-lead">
            {content.sellHero.sub}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {stat && (
              <span className="inline-flex items-center gap-1.5 text-white">
                <Lightning size={16} weight="fill" className="text-amber-accent" />
                Typical response: {stat.label}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-stone-300">
              <Star size={16} weight="fill" className="text-amber-accent" />
              {content.reviews.rating} on Google ({content.reviews.count} reviews)
            </span>
          </div>
        </div>
      </PageHero>

      <div className="page-shell section-y">
        {/* Someone who wants a ballpark before filling in the full form. Only
            offered when they have not already come from the quote tool. */}
        {!prefill && (
          <p className="mb-8 text-sm text-meta">
            Want a rough number first?{" "}
            <Link href="/car-valuations" className="font-semibold text-forest-700 underline">
              Get an instant range
            </Link>{" "}
            without leaving any contact details.
          </p>
        )}
        <SellFlow
          tradeTarget={
            tradeCar ? { id: tradeCar.id, title: carTitle(tradeCar) } : null
          }
          prefill={prefill}
        />
      </div>
    </>
  );
}
