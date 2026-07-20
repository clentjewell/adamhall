import type { Metadata } from "next";
import { fetchPublicCars } from "@/lib/cars";
import { heroImages } from "@/lib/heroes";
import CarsBrowser from "@/components/CarsBrowser";
import WatchlistForm from "@/components/WatchlistForm";
import PageHero from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Cars for sale",
  description:
    "Browse Adam Hall's current stock of hand-picked used cars. Every car PPSR checked, honestly described and priced to sell.",
};

export const revalidate = 60;

export default async function CarsPage() {
  const cars = await fetchPublicCars();
  const makes = [...new Set(cars.map((c) => c.make))].sort();

  return (
    <>
      <PageHero
        image={heroImages.cars}
        imageAlt="The current row of stock on the lot"
        title="Cars for sale"
      >
        <p className="text-stone-200 max-w-[60ch] text-lg">
          Around 25 cars pass through here every month, so the good ones
          don&apos;t hang about. Sold cars stay up for a month so you can see
          what moves.
        </p>
      </PageHero>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <CarsBrowser cars={cars} />
        <Reveal className="mt-16 max-w-2xl">
          <WatchlistForm makes={makes} />
        </Reveal>
      </div>
    </>
  );
}
