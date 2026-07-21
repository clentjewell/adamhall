import type { Metadata } from "next";
import { fetchPublicCars } from "@/lib/cars";
import { getContent } from "@/lib/content";
import { pageHeroImages, pageHeroVideos } from "@/lib/heroes";
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
  const [cars, content] = await Promise.all([fetchPublicCars(), getContent()]);
  const makes = [...new Set(cars.map((c) => c.make))].sort();

  return (
    <>
      <PageHero
        image={pageHeroImages.cars}
        video={pageHeroVideos.cars}
        imageAlt="Adam alongside a car on the lot"
        title={content.carsHero.title}
        titleEditPath="carsHero.title"
      >
        <p data-edit="carsHero.sub" className="text-stone-200 max-w-[60ch] text-lg">
          {content.carsHero.sub}
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
