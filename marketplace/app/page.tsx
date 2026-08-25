/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { fetchPublicCars } from "@/lib/cars";
import StockCard from "@/components/site/StockCard";
import Button from "@/components/site/Button";
import SiteReveal from "@/components/site/SiteReveal";
import HeroFilm from "@/components/site/HeroFilm";
import { site, buyerTrustBar } from "@/lib/site-data/site";
import { homeHeroFilm, heroImages } from "@/lib/heroes";

/**
 * The home page, built to the "Carmarketplace UI mockups" artifact
 * (frames 1a desktop / 1b mobile).
 *
 * Deliberately a second route rather than a replacement: app/page.tsx and
 * page-Home.css stay exactly as they were so the two can be compared side by
 * side. Everything here reads from the same sources as the live page —
 * fetchPublicCars for stock, site-data for the trust claims and the phone
 * number — so nothing on the page is a static stand-in for something that
 * already works.
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
  // The lot as the hero's search panel needs it, and nothing else. The panel
  // counts in the browser, so whatever it is handed rides along in the page's
  // payload — passing whole cars would put every description, photo list and
  // inspection note in the HTML to produce eight numbers. These are exactly
  // the fields applyFilters reads (see Filterable).
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
    <div className="ah-site mp-home2">
      <SiteReveal />

      {/* --- Hero ----------------------------------------------------------
          One film, looping quietly behind the words and the marketplace's own
          search panel. It was a scroll-scrubbed film through four beats; Adam
          asked for the scrubbing to go, which also puts the opener back inside
          the identity rather than in a departure Liz was being asked to rule
          on. HeroFilm carries the reasoning, and lib/heroes.ts carries why the
          looping film is a different file to the scrubbed one.

          The stock count no longer comes in here — the search panel's own head
          states the size of the range, from the same list. */}
      <HeroFilm
        src={homeHeroFilm.src}
        poster={homeHeroFilm.poster}
        cars={searchCars}
      />

      {/* --- What this is --------------------------------------------------
          Replaces the five-claim strip that used to sit here. The strip
          asserted things about the business without ever saying what the
          business was, so a reader arriving cold went from a film straight
          to a grid of cars with no idea whether this was a classifieds
          board, an aggregator or a dealer.

          It says the plain thing first, then splits into the two jobs the
          site actually does, which the old strip did not hint at either: you
          can buy a car from us, and you can sell us yours. The five claims
          are kept rather than lost — they still come from buyerTrustBar, so
          they change in one place — but they now sit under a statement that
          gives them something to attach to. */}
      <section className="mp2-intro" aria-labelledby="mp2-intro-title">
        <div className="container container--wide">
          <p className="eyebrow">What this is</p>
          <h2 id="mp2-intro-title" className="mp2-intro__title">
            A dealer&apos;s own lot, not a classifieds board
          </h2>
          <p className="mp2-intro__lead">
            We buy cars across the Gold Coast, Brisbane and the Northern
            Rivers, check them properly, and list the ones worth selling.
            Every car on this site is one we own and put our name to.
          </p>

          <div className="mp2-intro__paths">
            <div className="mp2-intro__path">
              <h3 className="mp2-intro__path-title">If you are buying</h3>
              <p className="mp2-intro__path-text">
                {inStock > 0
                  ? `${inStock} car${inStock === 1 ? "" : "s"} on the lot right now, every one PPSR checked with any fault named in the description.`
                  : "A short, hand-picked range, every one PPSR checked with any fault named in the description."}
              </p>
              <Button to="/cars" variant="green" arrow>
                See the cars
              </Button>
            </div>

            <div className="mp2-intro__path">
              <h3 className="mp2-intro__path-title">If you are selling</h3>
              <p className="mp2-intro__path-text">
                Tell us about your car and see the range it sits in straight
                away. No account and no phone number needed for the number.
              </p>
              <Button to="/car-valuations" variant="outline-green" arrow>
                What is mine worth?
              </Button>
            </div>
          </div>

          <ul className="mp2-intro__claims">
            {buyerTrustBar.map((item) => (
              <li key={item.label}>{item.label}</li>
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
          stock section and the story splits below. The photograph shows the
          exact thing the button offers.
          The footer's valuation band stands down on this route, so the pitch
          is made once. */}
      <section className="mp2-valuation" aria-label="Instant car valuation">
        <div className="mp2-valuation__media">
          <img
            src={heroImages.sell}
            alt="Handing over the keys after a sale"
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
              <li>We pick, check and price every car ourselves</li>
              <li>If we wouldn&rsquo;t put our name on it, it isn&rsquo;t listed</li>
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
              src={heroImages.home}
              alt="The yard at dusk with the stock lined up"
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
                <li>Sold cars stay up three months so you can see what moves</li>
              </ul>
              <div className="mp2-split__actions">
                <Button to="/faq" variant="outline-green" arrow>
                  Common questions
                </Button>
              </div>
            </div>
            <div className="mp2-split__media reveal-left">
              <img
                src="/assets/images/talking-a-buyer-through-a-car.jpg"
                alt="Talking a buyer through a car"
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
          band, with the trust line inside it. */}
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
        </div>
      </section>
    </div>
  );
}
