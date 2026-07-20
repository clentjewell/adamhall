import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Clock, HandCoins } from "@phosphor-icons/react/dist/ssr";
import { fetchPublicCars } from "@/lib/cars";
import CarCard from "@/components/CarCard";
import ReviewsStrip from "@/components/ReviewsStrip";

export default async function HomePage() {
  const cars = await fetchPublicCars();
  const live = cars.filter((c) => c.status === "published");
  const latest = live.slice(0, 4);
  const hero = live[0];

  return (
    <>
      {/* Split hero: copy left, newest car right */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-16 md:pt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight leading-[1.05]">
            Good cars. Straight answers. Money that moves fast.
          </h1>
          <p className="mt-5 text-lg text-stone-600 leading-relaxed max-w-[42ch]">
            Every car here is one Adam picked, checked and priced himself. What
            we say about it is what you get.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cars" className="btn-primary">
              Browse the cars
              <ArrowRight size={18} weight="bold" />
            </Link>
            <Link href="/sell" className="btn-secondary">
              Sell your car
            </Link>
          </div>
        </div>
        {hero && (
          <Link
            href={`/cars/${hero.slug}`}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
          >
            <Image
              src={hero.photos[0]?.url ?? ""}
              alt={hero.photos[0]?.alt ?? `${hero.year} ${hero.make} ${hero.model}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5 pt-16">
              <p className="text-white font-display font-bold text-lg">
                Just in: {hero.year} {hero.make} {hero.model}
              </p>
            </div>
          </Link>
        )}
      </section>

      {/* Why people deal with Adam */}
      <section className="border-y border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3">
          <div className="flex gap-3.5">
            <ShieldCheck size={28} className="text-forest-600 shrink-0" weight="duotone" />
            <div>
              <p className="font-bold">Checked before listed</p>
              <p className="text-sm text-stone-600 mt-1">
                PPSR, service books and an honest once-over on every single car.
              </p>
            </div>
          </div>
          <div className="flex gap-3.5">
            <HandCoins size={28} className="text-forest-600 shrink-0" weight="duotone" />
            <div>
              <p className="font-bold">The price is the price</p>
              <p className="text-sm text-stone-600 mt-1">
                No add-on games at the desk. The number on the car is the deal.
              </p>
            </div>
          </div>
          <div className="flex gap-3.5">
            <Clock size={28} className="text-forest-600 shrink-0" weight="duotone" />
            <div>
              <p className="font-bold">Settlements that settle</p>
              <p className="text-sm text-stone-600 mt-1">
                Paperwork done properly and funds moved the same day it clears.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest arrivals */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Latest arrivals</h2>
          <Link href="/cars" className="btn-ghost text-sm shrink-0">
            All cars
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
        {latest.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((car, i) => (
              <CarCard key={car.id} car={car} priority={i < 2} />
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center text-stone-500">
            New stock is on its way. Check back shortly or jump on the watchlist.
          </div>
        )}
      </section>

      {/* Sell band */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="card !bg-forest-600 !border-forest-700 text-white p-8 md:p-12 md:flex items-center justify-between gap-8">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              Selling? Adam will look at it today.
            </h2>
            <p className="mt-3 text-forest-100 max-w-[52ch] leading-relaxed">
              Five minutes on your phone: rego, a few photos, done. Adam
              personally reviews every car and comes back with a real number
              within one business day.
            </p>
          </div>
          <Link
            href="/sell"
            className="btn bg-white text-forest-700 hover:bg-forest-50 px-6 py-3 mt-6 md:mt-0 shrink-0"
          >
            Start with your rego
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </section>

      <ReviewsStrip />
    </>
  );
}
