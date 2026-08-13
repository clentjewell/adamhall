import type { Metadata } from "next";
import { fetchPublicCars } from "@/lib/cars";
import { getContent } from "@/lib/content";
import CarsBrowser from "@/components/CarsBrowser";
import WatchlistForm from "@/components/WatchlistForm";

export const metadata: Metadata = {
  title: "Cars for sale",
  description:
    "Browse Adam Hall's current stock of hand-picked used cars. Every car PPSR checked, honestly described and priced to sell.",
};

export const revalidate = 60;

export default async function CarsPage() {
  const [cars, content] = await Promise.all([fetchPublicCars(), getContent()]);
  const makes = [...new Set(cars.map((c) => c.make))].sort();

  const inStock = cars.filter((c) => c.status === "published").length;

  return (
    <>
      {/* Typographic header, per the mockup: hero media belongs to the home
          page only; here the cars themselves are the picture. */}
      <header className="page-shell pt-10">
        <p className="type-label text-forest-600">
          {inStock} car{inStock === 1 ? "" : "s"} in stock
        </p>
        <h1 data-edit="carsHero.title" className="type-heading mt-2">
          {content.carsHero.title}
        </h1>
        <p data-edit="carsHero.sub" className="mt-3 max-w-[60ch] text-stone-600">
          {content.carsHero.sub}
        </p>
      </header>

      <div className="page-shell py-10">
        <CarsBrowser cars={cars} watchPanel={<WatchlistForm makes={makes} />} />
      </div>
    </>
  );
}
