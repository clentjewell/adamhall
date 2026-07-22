import type { Metadata } from "next";
import { Lightning, Star } from "@phosphor-icons/react/dist/ssr";
import { fetchCarBySlug } from "@/lib/cars";
import { getResponseStat } from "@/lib/stats";
import { carTitle } from "@/lib/format";
import { getContent } from "@/lib/content";
import { heroImages } from "@/lib/heroes";
import SellFlow from "@/components/sell/SellFlow";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Sell your car",
  description:
    "Sell your car to Adam Hall in about five minutes. Rego, a few photos, done — Adam personally reviews every car and makes a real offer within 1 business day.",
};

interface Props {
  searchParams: Promise<{ trade?: string }>;
}

export default async function SellPage({ searchParams }: Props) {
  const { trade } = await searchParams;
  const [stat, tradeCar, content] = await Promise.all([
    getResponseStat(),
    trade ? fetchCarBySlug(trade) : Promise.resolve(null),
    getContent(),
  ]);

  return (
    <>
      <PageHero
        image={heroImages.sell}
        imageAlt="Keys changing hands over a car bonnet"
        title={content.sellHero.title}
      >
        <div>
          <p className="text-stone-200 max-w-[52ch] text-lg">{content.sellHero.sub}</p>
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

      <div className="max-w-6xl mx-auto px-4 py-12">
        <SellFlow
          tradeTarget={
            tradeCar ? { id: tradeCar.id, title: carTitle(tradeCar) } : null
          }
        />
      </div>
    </>
  );
}
