/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { fetchPublicCars } from "@/lib/cars";
import CarCard from "@/components/CarCard";
import TrustBar from "@/components/site/TrustBar";
import IconList from "@/components/site/IconList";
import FaqSection from "@/components/site/FaqSection";
import Button from "@/components/site/Button";
import SiteReveal from "@/components/site/SiteReveal";
import { site, buyerTrustBar } from "@/lib/site-data/site";
import { homeHeroImage } from "@/lib/heroes";

export const metadata: Metadata = {
  title: "Hand-picked used cars on the Gold Coast",
  description:
    "Hand-picked used cars across the Gold Coast, Brisbane and Northern Rivers. Every one PPSR checked, faults named in the description, priced to sell.",
};

export default async function HomePage() {
  const cars = await fetchPublicCars();
  // Three, not four. The proposition is hand-picked, and three larger cards
  // carry that better than a full grid of small ones.
  const latest = cars.filter((c) => c.status === "published").slice(0, 3);

  return (
    <div className="ah-site mp-home">
      <SiteReveal />

      {/* Hero. Shorter than the parent's portrait-split, and it hands over to
          the stock grid rather than filling the viewport on its own.
          Adam's signature and the 4CRB badge are deliberately absent. Both are
          the parent brand's assets — the signature belongs where Adam signs off
          himself, and the radio segment is his credential, not the
          Marketplace's. */}
      <section className="mp-hero bg-green">
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
          <div className="mp-hero__media">
            <img
              src={homeHeroImage}
              alt="A customer shaking hands with Adam Hall beside the car he has just bought"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      {/* Stock first. The listings ride up over the green edge so the page
          opens on cars rather than on a picture of a person. */}
      {latest.length > 0 ? (
        <section className="mp-stock">
          <div className="container container--wide">
            <div className="mp-stock__grid">
              {latest.map((car, i) => (
                <CarCard key={car.id} car={car} priority={i < 3} />
              ))}
            </div>
            <div className="mp-stock__footer reveal">
              <h2 className="mp-stock__title">Cars for sale right now</h2>
              <Button to="/cars" variant="tan" arrow>
                View all cars
              </Button>
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

      {/* Honesty: what the listing tells you.
          Was a third image/text split in a row, which is the parent's rhythm
          and reads as a template by the third pass. A green statement band
          instead: it breaks the run, and it puts a second dark ground on the
          page so the cream stretch is not eight screens long.
          The hassle-free guarantee badge is gone from here — it is the parent's
          selling promise, not a buy-side claim. */}
      <section className="section bg-green">
        <div className="container container--wide mp-honest">
          <h2 className="mp-honest__title reveal-left">
            If there&rsquo;s a mark on it, we say so
          </h2>
          <div className="reveal-right">
            <ul className="mp-honest__list">
              <li>A PPSR check before anything goes up</li>
              <li>Full service history and condition, written out</li>
              <li>Sold cars stay up a month so you can see what moves</li>
            </ul>
            <div className="mp-honest__actions">
              <Button to="/faq" variant="outline-white" arrow>
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
                height={430}
              />
            </div>
          </div>
        </div>
      </section>

      <FaqSection />

      {/* Closing CTA, buy side. The crossing to Adam is named separately in the
          footer band, so this one stays on the cars.
          Green, not the parent's lilac band: the identity keeps lilac for
          moments that are Adam himself, and the buy-side homepage was ending on
          a full screen of it. */}
      <section className="section bg-green mp-close">
        <div className="container container--narrow reveal">
          <h2 className="mp-close__title">
            Every car here is hand-picked. The good ones don&rsquo;t hang about.
          </h2>
          <Button to="/cars" variant="tan" arrow>
            Cars for sale
          </Button>
        </div>
      </section>
    </div>
  );
}
