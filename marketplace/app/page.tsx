import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CaretDown, ShieldCheck, Clock, HandCoins } from "@phosphor-icons/react/dist/ssr";
import { fetchPublicCars } from "@/lib/cars";
import { getContent } from "@/lib/content";
import { heroImages, heroVideo } from "@/lib/heroes";
import CarCard from "@/components/CarCard";
import HeroVideo from "@/components/HeroVideo";
import QuickSearch from "@/components/home/QuickSearch";
import ReviewsStrip from "@/components/ReviewsStrip";
import Marquee from "@/components/motion/Marquee";
import { Reveal, HeroStagger, HeroItem, CardReveal } from "@/components/motion/Reveal";

export default async function HomePage() {
  const [cars, content] = await Promise.all([fetchPublicCars(), getContent()]);
  const live = cars.filter((c) => c.status === "published");
  const latest = live.slice(0, 4);
  const makes = [...new Set(live.map((c) => c.make))].sort();
  const bodies = [...new Set(live.map((c) => c.body_type))].sort();

  return (
    <>
      {/* True full-page hero: the video runs edge-to-edge under the
          transparent header (-mt-16 pulls it behind the sticky bar) */}
      <section className="relative min-h-[100dvh] -mt-16 flex items-end">
        <HeroVideo
          src={heroVideo}
          poster={heroImages.home}
          posterAlt="The Adam Hall forecourt at dusk"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/15" />
        <div className="relative w-full max-w-6xl mx-auto px-4 pb-20 pt-40">
          <HeroStagger className="max-w-2xl">
            <HeroItem>
              <h1 className="font-display font-extrabold text-5xl md:text-7xl uppercase tracking-normal leading-[0.95] text-white">
                {content.hero.headline}
              </h1>
            </HeroItem>
            <HeroItem>
              <p className="mt-5 text-lg md:text-xl text-stone-200 leading-relaxed max-w-[44ch]">
                {content.hero.subtext}
              </p>
            </HeroItem>
            <HeroItem>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/cars" className="btn bg-white text-forest-800 hover:bg-forest-50 px-7 py-3.5 text-base">
                  {content.hero.ctaPrimary}
                  <ArrowRight size={18} weight="bold" />
                </Link>
                <Link
                  href="/sell"
                  className="btn border-2 border-white/70 text-white hover:bg-white/10 px-7 py-3.5 text-base"
                >
                  {content.hero.ctaSecondary}
                </Link>
              </div>
            </HeroItem>
            <HeroItem>
              <div className="mt-6">
                <QuickSearch makes={makes} bodies={bodies} />
              </div>
            </HeroItem>
          </HeroStagger>
          <a
            href="#why"
            aria-label="Scroll to why people deal with Adam"
            className="absolute bottom-6 right-6 hidden md:flex w-11 h-11 rounded-full border border-white/40 text-white items-center justify-center hover:bg-white/10 transition-colors"
          >
            <CaretDown size={20} weight="bold" />
          </a>
        </div>
      </section>

      {/* What's on the lot right now */}
      <Marquee items={[...new Set(live.map((c) => `${c.make} ${c.model}`))]} />

      {/* Why people deal with Adam */}
      <section id="why" className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-3">
          {content.why.map((point, i) => ({
            icon: [ShieldCheck, HandCoins, Clock][i % 3],
            title: point.title,
            body: point.body,
          })).map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="flex gap-3.5">
                <item.icon size={28} className="text-forest-600 shrink-0" weight="duotone" />
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-stone-600 mt-1">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Latest arrivals */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="font-display font-bold text-2xl md:text-3xl">Latest arrivals</h2>
            <Link href="/cars" className="btn-ghost text-sm shrink-0">
              All cars
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </Reveal>
        {latest.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((car, i) => (
              <CardReveal key={car.id} index={i}>
                <CarCard car={car} priority={i < 2} />
              </CardReveal>
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
        <Reveal>
          <div className="relative card overflow-hidden !border-forest-700 text-white p-8 md:p-12">
            <Image
              src={heroImages.sell}
              alt=""
              fill
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-forest-800/85" />
            <div className="relative md:flex items-center justify-between gap-8">
              <div>
                <h2 className="font-display font-bold text-2xl md:text-3xl">
                  {content.sellBand.heading}
                </h2>
                <p className="mt-3 text-forest-100 max-w-[52ch] leading-relaxed">
                  {content.sellBand.body}
                </p>
              </div>
              <Link
                href="/sell"
                className="btn bg-white text-forest-700 hover:bg-forest-50 px-6 py-3 mt-6 md:mt-0 shrink-0"
              >
                {content.sellBand.cta}
                <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <ReviewsStrip />
    </>
  );
}
