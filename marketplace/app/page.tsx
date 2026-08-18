/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { fetchPublicCars } from "@/lib/cars";
import StockCard from "@/components/site/StockCard";
import Button from "@/components/site/Button";
import SiteReveal from "@/components/site/SiteReveal";
import HeroVideo from "@/components/HeroVideo";
import { site, buyerTrustBar } from "@/lib/site-data/site";
import { parentSite, parentUrl } from "@/lib/brand";
import { pageHeroImages, pageHeroVideos } from "@/lib/heroes";

/**
 * The home page, built to the "Carmarketplace UI mockups" artifact
 * (frames 1a desktop / 1b mobile).
 *
 * Deliberately a second route rather than a replacement: app/page.tsx and
 * page-Home.css stay exactly as they were so the two can be compared side by
 * side. Everything here reads from the same sources as the live page —
 * fetchPublicCars for stock, site-data for the trust claims and the phone
 * number, lib/brand for the crossing back to Adam — so nothing on the page is
 * a static stand-in for something that already works.
 */
export const metadata: Metadata = {
  title: "Hand-picked used cars on the Gold Coast",
  description:
    "Hand-picked used cars across the Gold Coast, Brisbane and Northern Rivers. Every one PPSR checked, faults named in the description, priced to sell.",
  // Kept out of the index while it runs alongside the live home page: two
};

export default async function Home2Page() {
  const cars = await fetchPublicCars();
  const published = cars.filter((c) => c.status === "published");
  // Three, not four. The proposition is hand-picked, and three larger cards
  // carry that better than a full grid of small ones.
  const latest = published.slice(0, 3);
  const inStock = published.length;
  const viewAllLabel = `View all ${inStock} car${inStock === 1 ? "" : "s"}`;

  return (
    <div className="ah-site mp-home2">
      <SiteReveal />

      {/* --- Hero ---------------------------------------------------------
          The same film and poster as the live page. HeroVideo keeps the
          poster up for reduced-motion and save-data users, so this reads as
          a still hero for them.
          Adam's signature and the 4CRB badge stay absent: both are the parent
          brand's assets, and the radio segment is his credential rather than
          the Marketplace's. */}
      <section className="mp2-hero">
        <HeroVideo
          src={pageHeroVideos.home}
          poster={pageHeroImages.home}
          posterAlt="A customer shaking hands with Adam Hall beside the car he has just bought"
        />
        <div className="mp2-hero__scrim" />
        <div className="container container--wide mp2-hero__inner">
          <div className="mp2-hero__content">
            <span className="eyebrow">
              Gold Coast &middot; Brisbane &middot; Northern Rivers
            </span>
            <h1 className="mp2-hero__title">Cars worth putting our name on</h1>
            <p className="mp2-hero__sub">
              Every car here is one Adam decided was worth buying. What the
              listing says is what you get.
            </p>
            <div className="mp2-hero__actions">
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

      {/* --- Trust strip --------------------------------------------------
          Driven by buyerTrustBar rather than retyped: these are the buy
          side's five claims, and they change in one place. Icons are dropped
          here because the artifact sets this band as type only. */}
      <section className="mp2-trust" aria-label="Why buy from Car Marketplace">
        <div className="container container--wide">
          <ul className="mp2-trust__grid">
            {buyerTrustBar.map((item) => (
              <li key={item.label} className="mp2-trust__item">
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Stock --------------------------------------------------------
          Cars first, and the count in the link is the real one. */}
      <section className="mp2-stock">
        <div className="container container--wide">
          <div className="mp2-stock__head reveal">
            <div>
              <span className="eyebrow">In stock now</span>
              <h2 className="mp2-stock__title">Cars for sale right now</h2>
            </div>
            {inStock > 0 && (
              <Link href="/cars" className="mp2-link-strong">
                {viewAllLabel} <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>

          {latest.length > 0 ? (
            <>
              <div className="mp2-stock__grid">
                {latest.map((car, i) => (
                  <StockCard key={car.id} car={car} priority={i < 3} basePath="/cars" />
                ))}
              </div>
              {/* Phone-only stand-in for the link in the heading row, as a
                  full-width target. The two are mutually exclusive — each is
                  display:none at the other's width — so only ever one of them
                  is in the accessibility tree. */}
              <div className="mp2-stock__foot">
                <Button to="/cars" variant="outline-green" arrow>
                  {viewAllLabel}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mp2-stock__empty">
                Fresh stock is on its way. Take a look at everything currently
                available.
              </p>
              <Button to="/cars" variant="tan" arrow>
                View all cars for sale
              </Button>
            </>
          )}
        </div>
      </section>

      {/* --- Valuation -----------------------------------------------------
          The crossing to the valuation tool, first thing after the stock, as
          it is on the live home page. A full-bleed band rather than a card in
          the container, so it reads as a change of ground between the white
          stock section and the story splits below. Adam is in the photograph
          doing the exact thing the button offers.
          The footer's valuation band stands down on this route, so the pitch
          is made once. */}
      <section className="mp2-valuation" aria-label="Instant car valuation">
        <div className="mp2-valuation__media">
          <img
            src="/assets/images/Adam-Hall-Value-My-Car.jpg"
            alt="Adam Hall valuing a car with its owner in their driveway"
            loading="lazy"
            width={640}
            height={427}
          />
        </div>
        <div className="mp2-valuation__body">
          {/* Held to a reading measure: the band is full width, the words
              are not. */}
          <div className="mp2-valuation__text">
            <span className="eyebrow">Selling or trading in?</span>
            <h2 className="mp2-valuation__title">
              What&rsquo;s my car{" "}
              <span className="mp2-valuation__accent">worth?</span>
            </h2>
            <p className="mp2-valuation__sub">
              Tell us the car and see the range it sits in, straight away. No
              account, no contact details, just the number.
            </p>
          </div>
          <div className="mp2-valuation__actions">
            <Button to="/car-valuations" variant="tan" arrow>
              Get an instant range
            </Button>
            <Button href={site.phoneHref} variant="outline-white">
              Call {site.phoneDisplay}
            </Button>
          </div>
        </div>
      </section>

      {/* --- Curation: how the stock gets chosen --------------------------- */}
      <section className="container container--wide">
        <div className="mp2-split">
          <div className="reveal-left">
            <span className="eyebrow">Curated, not classified</span>
            <h2 className="mp2-split__title">
              We have already done the sorting
            </h2>
            <p className="mp2-split__text">
              The cars here move quickly, and the ones on the site are the ones
              that made the cut.
            </p>
            <ul className="mp2-list">
              <li>Adam picks, checks and prices every car himself</li>
              <li>If he wouldn&rsquo;t put his name on it, it isn&rsquo;t listed</li>
              <li>The price on the car is the price you pay</li>
            </ul>
            <div className="mp2-split__actions">
              <Button to="/cars" variant="outline-green" arrow>
                See what&rsquo;s in stock
              </Button>
            </div>
          </div>
          <div className="mp2-split__media reveal-right">
            <img
              src="/assets/images/Adam-Hall-Value-My-Car-2.jpg"
              alt="Adam Hall looking over a car in a driveway"
              loading="lazy"
              width={640}
              height={533}
            />
          </div>
        </div>
      </section>

      {/* --- Honesty: what the listing tells you ---------------------------
          The mirror of the sorting split — photograph left, words right — on
          a white band, so the two read as a pair rather than as two similar
          rows. The hassle-free guarantee badge stays out: it is the parent's
          selling promise, not a buy-side claim. */}
      <section className="mp2-band">
        <div className="container container--wide">
          <div className="mp2-split mp2-split--flip">
            <div className="reveal-right">
              <span className="eyebrow">Honestly described</span>
              <h2 className="mp2-split__title">
                If there&rsquo;s a mark on it, we say so
              </h2>
              <p className="mp2-split__text">
                We don&rsquo;t describe a car better than it is. Read the
                listing, look at the photos, and you already know what
                you&rsquo;re turning up to.
              </p>
              <ul className="mp2-list">
                <li>A PPSR check before anything goes up</li>
                <li>Full service history and condition, written out</li>
                <li>Sold cars stay up a month so you can see what moves</li>
              </ul>
              <div className="mp2-split__actions">
                <Button to="/faq" variant="outline-green" arrow>
                  Common questions
                </Button>
              </div>
            </div>
            <div className="mp2-split__media reveal-left">
              <img
                src="/assets/images/Adam-Hall-Car-Buying-Gold-Coast-1.jpg"
                alt="Adam Hall talking a buyer through a car"
                loading="lazy"
                width={640}
                height={533}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Closing call to action ----------------------------------------
          A rounded green card floating on the cream rather than a full-bleed
          band, with the trust line inside it. The crossing to Adam is named
          underneath, worded from lib/brand so both sites say the same thing. */}
      <section className="section">
        <div className="container container--wide">
          <div className="mp2-close reveal">
            <div>
              <h2 className="mp2-close__title">
                Every car here is hand-picked. The good ones don&rsquo;t hang
                about.
              </h2>
              <p className="mp2-close__meta">
                Every car PPSR checked &middot; Faults named in the description
                &middot; Priced to sell
              </p>
            </div>
            <Button to="/cars" variant="tan" arrow>
              Cars for sale
            </Button>
          </div>
          <p className="mp2-crossing">
            {parentSite.crossing.heading} {parentSite.crossing.body}{" "}
            <a
              href={parentUrl("/", "marketplace-home2-close")}
              target="_blank"
              rel="noopener"
            >
              {parentSite.crossing.cta} &rarr;
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
