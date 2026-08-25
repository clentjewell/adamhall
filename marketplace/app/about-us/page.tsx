/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { fetchPublicCars } from "@/lib/cars";
import Button from "@/components/site/Button";
import SiteReveal from "@/components/site/SiteReveal";
import HeaderFilm from "@/components/site/HeaderFilm";
import { site, buyerTrustBar } from "@/lib/site-data/site";
import { headerFilms, heroImages } from "@/lib/heroes";

/**
 * About Us (route: /about-us) — the story the home page used to tell, moved
 * here whole when the marketplace became the landing page at Adam's
 * direction. What this business is, the buy/sell split, the valuation pitch,
 * the two claim cards and the closing call all came across as they were;
 * only the buttons' destinations changed, since the cars now live at /.
 *
 * The head takes the same film band every other inner page uses. The film is
 * the slow pass along the row of stock — the yard is this page's subject as
 * much as it is the marketplace's.
 */
export const metadata: Metadata = {
  title: "About us",
  description:
    "One dealer, one lot. We buy cars across the Gold Coast, Brisbane and the Northern Rivers, check them properly, and list the ones worth selling.",
};

export const revalidate = 60;

export default async function AboutUsPage() {
  const cars = await fetchPublicCars();
  const inStock = cars.filter((c) => c.status === "published").length;

  return (
    <div className="ah-site mp-home2">
      <SiteReveal />

      <header className="mp2-pagehead mp2-pagehead--film">
        <HeaderFilm src={headerFilms.cars} />
        <div className="container container--wide">
          <p className="eyebrow">About us</p>
          <h1 className="mp2-pagehead__title">
            A dealer&apos;s own lot, not a classifieds board
          </h1>
          <p className="mp2-pagehead__sub">
            We buy cars across the Gold Coast, Brisbane and the Northern
            Rivers, check them properly, and list the ones worth selling.
            Every car on this site is one we own and put our name to.
          </p>
        </div>
      </header>

      {/* --- The two jobs the site does -------------------------------------
          You can buy a car from us, and you can sell us yours. The five trust
          claims still come from buyerTrustBar, so they change in one place. */}
      <section className="mp2-intro" aria-labelledby="mp2-intro-title">
        <div className="container container--wide">
          <p className="eyebrow">What this is</p>
          <h2 id="mp2-intro-title" className="mp2-intro__title">
            Two ways to deal with us
          </h2>
          <p className="mp2-intro__lead">
            No consignment, no brokering, no listing other people&apos;s cars.
            We put our own money into every car here, which is why we are
            careful about which ones make it.
          </p>

          <div className="mp2-intro__paths">
            <div className="mp2-intro__path">
              <h3 className="mp2-intro__path-title">If you are buying</h3>
              <p className="mp2-intro__path-text">
                {inStock > 0
                  ? `${inStock} car${inStock === 1 ? "" : "s"} on the lot right now, every one PPSR checked with any fault named in the description.`
                  : "A short, hand-picked range, every one PPSR checked with any fault named in the description."}
              </p>
              <Button to="/" variant="green" arrow>
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

      {/* --- Curation: how the stock gets chosen ---------------------------
          A two-up card: the words in the padded half, the photograph filling
          the other half to the card's own edge. Adam's format. */}
      <section className="container container--wide mp2-splits">
        <div className="mp2-split">
          <div className="mp2-split__body reveal-left">
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
              <Button to="/" variant="green" arrow>
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
          The mirror of the sorting card — photograph left, words right. */}
      <section className="container container--wide mp2-splits">
        <div className="mp2-split mp2-split--flip">
          <div className="mp2-split__body reveal-right">
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
      </section>

      {/* --- Valuation -----------------------------------------------------
          The crossing to the valuation tool. A full-bleed band, so it reads
          as a change of ground between the white cards and the closing call.
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

      {/* --- Closing call to action ----------------------------------------
          A rounded green card floating on the cream, with the trust line
          inside it. */}
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
            <Button to="/" variant="tan" arrow>
              Cars for sale
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
