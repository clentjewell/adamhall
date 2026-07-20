import type { Metadata } from "next";
import { Lightning } from "@phosphor-icons/react/dist/ssr";
import { fetchCarBySlug } from "@/lib/cars";
import { getResponseStat } from "@/lib/stats";
import { carTitle } from "@/lib/format";
import { googleReviews } from "@/lib/config";
import SellFlow from "@/components/sell/SellFlow";

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
  const [stat, tradeCar] = await Promise.all([
    getResponseStat(),
    trade ? fetchCarBySlug(trade) : Promise.resolve(null),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="max-w-xl mx-auto text-center mb-10">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
          Sell your car without the circus
        </h1>
        <p className="mt-3 text-stone-600 leading-relaxed">
          About five minutes on your phone. No listing fees, no tyre-kickers,
          no strangers at your house.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
          {stat && (
            <span className="inline-flex items-center gap-1.5 text-forest-700">
              <Lightning size={16} weight="fill" className="text-amber-accent" />
              Typical response: {stat.label}
            </span>
          )}
          <span className="text-stone-500">
            {googleReviews.rating}★ on Google ({googleReviews.count} reviews)
          </span>
        </div>
      </div>

      <SellFlow
        tradeTarget={
          tradeCar ? { id: tradeCar.id, title: carTitle(tradeCar) } : null
        }
      />
    </div>
  );
}
