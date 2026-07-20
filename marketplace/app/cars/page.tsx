import type { Metadata } from "next";
import { fetchPublicCars } from "@/lib/cars";
import CarsBrowser from "@/components/CarsBrowser";
import WatchlistForm from "@/components/WatchlistForm";

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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
        Cars for sale
      </h1>
      <p className="mt-2 text-stone-600 max-w-[60ch]">
        Around 25 cars pass through here every month, so the good ones don&apos;t
        hang about. Sold cars stay up for a month so you can see what moves.
      </p>

      <div className="mt-8">
        <CarsBrowser cars={cars} />
      </div>

      <div className="mt-16 max-w-2xl">
        <WatchlistForm makes={makes} />
      </div>
    </div>
  );
}
