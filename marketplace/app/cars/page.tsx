import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPublicCars } from "@/lib/cars";
import { getContent } from "@/lib/content";
import CarsBrowserV2 from "@/components/site/CarsBrowserV2";
import WatchlistForm from "@/components/WatchlistForm";
import SiteReveal from "@/components/site/SiteReveal";

/**
 * The cars page (route: /cars), built to the "Carmarketplace UI
 * mockups" artifact, frames 1c (desktop) and 1d (mobile).
 *
 * Same data and the same machinery as /cars — fetchPublicCars for stock,
 * getContent for the CMS-editable header, the URL-driven filters via
 * useCarFilters, and the real WatchlistForm with its server action. Only the
 * arrangement is new.
 */
export const metadata: Metadata = {
  title: "Cars for sale",
  description:
    "Browse our current stock of hand-picked used cars. Every car PPSR checked, honestly described and priced to sell.",
};

export const revalidate = 60;

export default async function Cars2Page() {
  const [cars, content] = await Promise.all([fetchPublicCars(), getContent()]);
  const makes = [...new Set(cars.map((c) => c.make))].sort();
  const inStock = cars.filter((c) => c.status === "published").length;

  return (
    <div className="ah-site mp-cars2">
      <SiteReveal />

      {/* Typographic header on a white band, per the artifact: hero media
          belongs to the home page, and here the cars themselves are the
          picture. */}
      <header className="mp2-pagehead">
        <div className="container container--wide">
          <p className="eyebrow">
            {inStock} car{inStock === 1 ? "" : "s"} in stock
          </p>
          <h1 data-edit="carsHero.title" className="mp2-pagehead__title">
            {content.carsHero.title}
          </h1>
          <p data-edit="carsHero.sub" className="mp2-pagehead__sub">
            {content.carsHero.sub}
          </p>
        </div>
      </header>

      {/* The browser reads its filters from the URL via useSearchParams, so
          it needs a Suspense boundary: without one, any render of this page
          that isn't already dynamic fails to prerender. */}
      <Suspense fallback={<div className="mp2-browser-fallback" aria-hidden="true" />}>
        <CarsBrowserV2
          cars={cars}
          basePath="/cars"
          watchPanel={<WatchlistForm makes={makes} />}
        />
      </Suspense>
    </div>
  );
}
