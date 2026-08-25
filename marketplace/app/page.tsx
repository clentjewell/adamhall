import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPublicCars } from "@/lib/cars";
import CarsBrowserV2 from "@/components/site/CarsBrowserV2";
import WatchlistForm from "@/components/WatchlistForm";
import SiteReveal from "@/components/site/SiteReveal";
import HeroFilm from "@/components/site/HeroFilm";
import { homeHeroFilm } from "@/lib/heroes";

/**
 * The home page IS the marketplace, at Adam's direction: the hero film with
 * the search band across its foot, then the full browsable stock — the same
 * CarsBrowserV2 that lived on /cars, filters, sort, sold section and
 * watchlist included. /cars redirects here (see app/cars/page.tsx for why the
 * individual car pages stay where they are).
 *
 * The story the home page used to tell — what this business is, the buy/sell
 * split, the honesty pitch — moved whole to /about-us. A buyer landing here
 * meets the cars; a buyer wondering who is behind them has a page named for
 * that question.
 *
 * The hero band and the browser share their state through the URL: the
 * band's quick search writes the q param live, its button commits the whole
 * selection and walks the reader down to #browse, and useCarFilters reads
 * both. One set of filters, two hands on it.
 */
export const metadata: Metadata = {
  title: "Hand-picked used cars on the Gold Coast",
  description:
    "Browse our current stock of hand-picked used cars across the Gold Coast, Brisbane and Northern Rivers. Every car PPSR checked, honestly described and priced to sell.",
};

export const revalidate = 60;

export default async function HomePage() {
  const cars = await fetchPublicCars();
  const published = cars.filter((c) => c.status === "published");
  const makes = [...new Set(cars.map((c) => c.make))].sort();

  // The lot as the hero's search panel needs it, and nothing else. The panel
  // counts in the browser, so whatever it is handed rides along in the page's
  // payload — the browser below gets the full cars anyway, but the band is
  // rendered inside the hero, which is a separate client boundary, so it
  // takes the same lean projection it always has (exactly the Filterable
  // fields).
  const searchCars = published.map((c) => ({
    make: c.make,
    model: c.model,
    year: c.year,
    price: c.price,
    body_type: c.body_type,
    transmission: c.transmission,
    fuel: c.fuel,
    odometer_km: c.odometer_km,
  }));

  return (
    <div className="ah-site mp-home2 mp-cars2">
      <SiteReveal />

      {/* --- Hero ----------------------------------------------------------
          One film, looping quietly behind the words and the marketplace's own
          search panel. HeroFilm carries the reasoning, and lib/heroes.ts
          carries why the looping film is a different file to the scrubbed
          one it replaced. */}
      <HeroFilm
        src={homeHeroFilm.src}
        poster={homeHeroFilm.poster}
        cars={searchCars}
      />

      {/* --- The stock -----------------------------------------------------
          The whole lot, straight after the hero. #browse is where the band's
          count button lands the reader. The browser reads its filters from
          the URL via useSearchParams, so it needs a Suspense boundary:
          without one, any render of this page that isn't already dynamic
          fails to prerender. */}
      <div id="browse">
        <Suspense fallback={<div className="mp2-browser-fallback" aria-hidden="true" />}>
          <CarsBrowserV2
            cars={cars}
            basePath="/cars"
            watchPanel={<WatchlistForm makes={makes} />}
          />
        </Suspense>
      </div>
    </div>
  );
}
