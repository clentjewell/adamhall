/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { fetchPublicCars } from "@/lib/cars";
import { getContent } from "@/lib/content";
import CarCard from "@/components/CarCard";
import TrustBar from "@/components/site/TrustBar";
import IconList from "@/components/site/IconList";
import FaqSection from "@/components/site/FaqSection";
import Button from "@/components/site/Button";
import SiteReveal from "@/components/site/SiteReveal";
import HeroVideo from "@/components/HeroVideo";
import { site, buyerTrustBar } from "@/lib/site-data/site";
import { pageHeroImages, pageHeroVideos } from "@/lib/heroes";

export const metadata: Metadata = {
  title: "Hand-picked used cars on the Gold Coast",
  description:
    "Hand-picked used cars across the Gold Coast, Brisbane and Northern Rivers. Every one PPSR checked, faults named in the description, priced to sell.",
};

export default async function HomePage() {
  const [cars, content] = await Promise.all([fetchPublicCars(), getContent()]);
  // Three, not four. The proposition is hand-picked, and three larger cards
  // carry that better than a full grid of small ones.
  const published = cars.filter((c) => c.status === "published");
  const latest = published.slice(0, 3);

  return (
    <>
      <div className="ah-site mp-home">
        <SiteReveal />

        {/* Hero. A full-height film, matching the inner pages, with the stock
            grid still riding up over its bottom edge so the page opens on cars
            rather than on a picture of a person.
            Adam's signature and the 4CRB badge are deliberately absent. Both are
            the parent brand's assets — the signature belongs where Adam signs off
            himself, and the radio segment is his credential, not the
            Marketplace's. */}
        {/* bg-green is the ground the film sits on, and what shows if it never
            arrives. HeroVideo keeps the poster up for reduced-motion and
            save-data users, so this reads as the old still hero for them. */}
        <section className="mp-hero bg-green">
          <HeroVideo
            src={pageHeroVideos.home}
            poster={pageHeroImages.home}
            posterAlt="A customer shaking hands with Adam Hall beside the car he has just bought"
          />
          <div className="mp-hero__scrim" />
          <div className="container container--wide mp-hero__inner">
            <div className="mp-hero__content">
              <span className="eyebrow eyebrow--hero">
                Gold Coast, Brisbane &amp; Northern Rivers
              </span>
              <h1 className="mp-hero__title">Cars worth putting our name on</h1>
              <p className="mp-hero__subtitle">
                Every car here is one Adam decided was worth buying. What the
                listing says is what you get.
              </p>
              <div className="mp-hero__actions">
                <Button to="/cars" variant="tan" arrow>
                  See the cars
                </Button>
                <Button href={site.phoneHref} variant="outline-white">
                  Call {site.phoneDisplay}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stock first. The listings ride up over the green edge so the page
            opens on cars rather than on a picture of a person. */}
        {latest.length > 0 ? (
          <section className="mp-stock">
            <div className="container container--wide mp-stock__inner">
              {/* The heading leads in the DOM and CSS order drops it below the
                  grid. Written the other way round, the three card h3s came
                  before the h2 that titles them — an h1 -> h3 jump, and the
                  cards read as belonging to the hero. */}
              <div className="mp-stock__footer reveal">
                {/* The count gives the row its second line, so the title is
                    not a lone word floating opposite a large pill, and it
                    says what "view all" leads to. */}
                <div className="mp-stock__heading">
                  <span className="eyebrow">
                    {published.length} car{published.length === 1 ? "" : "s"} in
                    stock
                  </span>
                  <h2 className="mp-stock__title">Cars for sale right now</h2>
                </div>
                <Button to="/cars" variant="tan" arrow>
                  View all cars
                </Button>
              </div>
              <div className="mp-stock__grid">
                {latest.map((car, i) => (
                  <CarCard key={car.id} car={car} priority={i < 3} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="mp-stock mp-stock--empty">
            <div className="container container--wide">
              <h2 className="mp-stock__title" style={{ marginBottom: "1rem" }}>
                Cars for sale right now
              </h2>
              <p style={{ marginBottom: "1.5rem" }}>
                Fresh stock is on its way. Take a look at everything currently
                available.
              </p>
              <div className="home-actions" style={{ justifyContent: "center" }}>
                <Button to="/cars" variant="tan" arrow>
                  View all cars for sale
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Valuation CTA, first section after the stock: a dedicated crossing
          to the tool rather than the tool itself. A full-bleed green band
          rather than a card in the container, so it reads as a change of
          ground between the white stock section and the trust bar; the
          height is the card's, only the width runs to the edges. Adam is in
          the photograph doing the exact thing the button offers.
          It sits outside the .ah-site wrapper because that scope's element
          margins override Tailwind's spacing utilities (unlayered rules beat
          layered ones); the tokens both systems share live on :root, so
          nothing else changes. The footer band stays hidden on this page so
          the pitch is made once. */}
      <section
        aria-label="Instant car valuation"
        className="grid bg-forest-700 lg:grid-cols-[minmax(0,28rem)_1fr]"
      >
        {/* Flush to the left edge of the window, full height of the band. */}
        <div className="relative hidden lg:block">
          <Image
            src="/assets/images/Adam-Hall-Value-My-Car.jpg"
            alt="Adam Hall valuing a car with its owner in their driveway"
            fill
            sizes="28rem"
            className="object-cover"
          />
        </div>
        {/* Words left, actions right, both centred on the band. Held to a
            reading measure and split this way so a full-width band does not
            leave half of itself empty. */}
        <div className="flex flex-col justify-center gap-7 px-4 py-11 sm:px-8 lg:py-20 lg:pl-14 lg:pr-10 xl:flex-row xl:items-center xl:justify-between xl:gap-12">
          <div className="max-w-[46ch]">
            <p className="type-label text-sand">Selling or trading in?</p>
            <h2 className="type-heading mt-2 text-white">
              What&rsquo;s my car <span className="text-sand">worth?</span>
            </h2>
            <p className="mt-3 text-stone-200">
              Tell us the car and see the range it sits in, straight away. No
              account, no contact details, just the number.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row xl:shrink-0">
            <Link href="/car-valuations" className="btn-cta">
              Get an instant range
              <ArrowRight size={18} weight="bold" />
            </Link>
            <a
              href={content.phone.tel}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/45 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10 active:translate-y-px"
            >
              Call {content.phone.display}
            </a>
          </div>
        </div>
      </section>

      <div className="ah-site mp-home">
        <TrustBar items={buyerTrustBar} label="Why buy from Car Marketplace" />

        {/* Intro: the problem this replaces */}
        <section className="section bg-cream home-intro">
          <div className="container container--narrow reveal">
            <h2 className="home-intro__title">
              Spent a night on the classifieds and still no idea which cars are
              honest?
            </h2>
            <p className="home-intro__text">
              Thousands of listings, every one written by someone who wants it
              gone. Then a Saturday driving around looking at cars that were
              nothing like the photos.
            </p>
          </div>
        </section>

        {/* Curation: how the stock gets chosen */}
        <section className="section bg-cream" style={{ paddingTop: 0 }}>
          <div className="container container--wide home-split">
            <div className="home-split__content reveal-left">
              <span className="eyebrow">Curated, not classified</span>
              <h2 className="home-split__title">We have already done the sorting</h2>
              <p>
                The cars here move quickly, and the ones on the site are the ones
                that made the cut.
              </p>
              <IconList
                items={[
                  "Adam picks, checks and prices every car himself",
                  "If he wouldn't put his name on it, it isn't listed",
                  "The price on the car is the price you pay",
                ]}
              />
              <div className="home-actions">
                <Button to="/cars" variant="tan" arrow>
                  See what's in stock
                </Button>
              </div>
            </div>
            <div className="home-split__media reveal-right">
              <img
                src="/assets/images/Adam-Hall-Value-My-Car-2.jpg"
                alt="Adam Hall looking over a car in a driveway"
                loading="lazy"
                width={640}
                height={480}
              />
            </div>
          </div>
        </section>

        {/* Honesty: what the listing tells you. The mockup sets this as the
            mirror of the sorting split — photograph left, words right — so the
            two story sections read as a pair. The hassle-free guarantee badge
            stays out: it is the parent's selling promise, not a buy-side claim. */}
        <section className="section bg-cream" style={{ paddingTop: 0 }}>
          <div className="container container--wide home-split home-split--flip">
            <div className="home-split__media reveal-left">
              <img
                src="/assets/images/Adam-Hall-Car-Buying-Gold-Coast-1.jpg"
                alt="Adam Hall talking a buyer through a car"
                loading="lazy"
                width={640}
                height={480}
              />
            </div>
            <div className="home-split__content reveal-right">
              <span className="eyebrow">Honestly described</span>
              <h2 className="home-split__title">
                If there&rsquo;s a mark on it, we say so
              </h2>
              <p>
                We don&rsquo;t describe a car better than it is. Read the listing,
                look at the photos, and you already know what you&rsquo;re turning
                up to.
              </p>
              <IconList
                items={[
                  "A PPSR check before anything goes up",
                  "Full service history and condition, written out",
                  "Sold cars stay up a month so you can see what moves",
                ]}
              />
              <div className="home-actions">
                <Button to="/faq" variant="green" arrow>
                  Common questions
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Customer proof is deliberately absent for now.
            Every testimonial and Google quote on this site is from a SELLER
            ("I will only sell my cars to Adam", "the money was in my account the
            same day"). On a page for buyers that is proof of the wrong thing, and
            the identity lists Adam's personal service promise among the claims the
            Marketplace must never make as its own. Rather than write buyer quotes
            nobody said, the section is out until Adam supplies two or three real
            ones. Both wave dividers went with it, so the cream runs straight
            through to the section below. */}

        {/* Who you are buying from */}
        <section className="section bg-cream home-voice">
          <div className="container container--wide">
            <img
              className="home-voice__logo reveal"
              src="/assets/logos/4crb-white.png"
              alt="4CRB 89.3FM"
              loading="lazy"
              width={130}
              height={65}
            />
            <div className="home-split">
              <div className="home-split__content reveal">
                <h2 className="home-split__title">
                  One person picked every car here
                </h2>
                <p>
                  No sales team, no head office. Adam Hall has spent twenty-seven
                  years working out which used cars are worth buying. These are the
                  ones he bought.
                </p>
                <p>
                  He&rsquo;s the voice behind &ldquo;What&rsquo;s your car
                  worth?&rdquo; on 4CRB 89.3FM, where he has valued more than ten
                  thousand cars live on air.
                </p>
                <IconList
                  items={[
                    "27 years in the automotive trade",
                    "10,000 valuations live on 4CRB 89.3FM",
                    "Buys the cars, checks them, prices them, stands behind them",
                  ]}
                />
                <div className="home-actions">
                  <Button to="/about-adam-hall" variant="green" arrow>
                    About Adam
                  </Button>
                </div>
              </div>
              <div className="home-split__media reveal">
                <img
                  src="/assets/images/Adam-Hall-4CRB-Gold-Coast-1.jpg"
                  alt="Adam Hall presenting What's Your Car Worth on 4CRB 89.3FM"
                  loading="lazy"
                  width={640}
                  height={480}
                />
              </div>
            </div>
          </div>
        </section>

        <FaqSection />

        {/* Closing CTA, buy side. The mockup sets this as a rounded green card
            floating on the cream rather than a full-bleed band, with the trust
            line inside it. The crossing to Adam stays named in the footer band. */}
        <section className="section bg-cream">
          <div className="container container--wide">
            <div className="mp-close-card reveal">
              <div>
                <h2 className="mp-close-card__title">
                  Every car here is hand-picked. The good ones don&rsquo;t hang
                  about.
                </h2>
                <p className="mp-close-card__meta">
                  Every car PPSR checked · Faults named in the description ·
                  Priced to sell
                </p>
              </div>
              <Button to="/cars" variant="tan" arrow>
                Cars for sale
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
