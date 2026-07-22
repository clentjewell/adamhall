/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { fetchPublicCars } from "@/lib/cars";
import CarCard from "@/components/CarCard";
import TrustBar from "@/components/site/TrustBar";
import IconList from "@/components/site/IconList";
import { TestimonialGrid } from "@/components/site/Testimonials";
import FeaturedTestimonial from "@/components/site/FeaturedTestimonial";
import FaqSection from "@/components/site/FaqSection";
import PurpleCta from "@/components/site/PurpleCta";
import Button from "@/components/site/Button";
import WaveDivider from "@/components/site/WaveDivider";
import SiteReveal from "@/components/site/SiteReveal";
import { homeTestimonials, heroQuote } from "@/lib/site-data/testimonials";
import { site } from "@/lib/site-data/site";

export const metadata: Metadata = {
  title: "Adam Hall | Sell your car, hassle-free!",
  description:
    "Gold Coast, Brisbane & Northern Rivers car owners let Adam Hall come to you, provide a FREE car valuation and, if you’re keen, buy your car hassle-free… all in 24hrs.",
};

export default async function HomePage() {
  const cars = await fetchPublicCars();
  const latest = cars.filter((c) => c.status === "published").slice(0, 4);

  return (
    <div className="ah-site">
      <SiteReveal />

      {/* Hero: full-bleed photo left, content right */}
      <section className="hero bg-green">
        <div className="hero__media">
          <img
            src="/assets/images/Adam-Hall-4CRB-Gold-Coast.jpg"
            alt="Adam Hall standing beside a customer's car on the Gold Coast"
            fetchPriority="high"
          />
          <img
            className="hero__signature"
            src="/assets/logos/logo-signature-white.svg"
            alt=""
            aria-hidden="true"
            width={170}
            height={76}
          />
        </div>
        <div className="hero__content">
          <span className="eyebrow eyebrow--hero">
            Gold Coast, Brisbane &amp; Northern Rivers
          </span>
          <h1 className="hero__title">
            Sell your car, <span className="wavy">hassle-free!</span>
          </h1>
          <p className="hero__subtitle">
            Let Adam come to you to buy your car quickly and easily, hassle free.
          </p>
          <div className="hero__actions">
            <Button href={site.phoneHref} variant="tan" arrow>
              Call Adam {site.phoneDisplay}
            </Button>
            <span className="hero__featured">
              <span>Featured On</span>
              <img
                src="/assets/logos/4crb-white.png"
                alt="4CRB 89.3FM"
                width={110}
                height={55}
              />
            </span>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Intro */}
      <section className="section bg-cream home-intro">
        <div className="container container--narrow reveal">
          <h2 className="home-intro__title">
            Thinking of selling your car but don&rsquo;t want the hassle of
            selling it privately or through a dealer?
          </h2>
          <p className="home-intro__text">
            Forget the hours of research, the cleaning &amp; detailing, the
            haggling, the no-shows, the lowball offers.
          </p>
        </div>
      </section>

      {/* Value my car — image right with welcome/hello bubbles */}
      <section className="section bg-cream" style={{ paddingTop: 0 }}>
        <div className="container container--wide home-split">
          <div className="home-split__content reveal-left">
            <span className="eyebrow">Value my car</span>
            <h3 className="home-split__title">
              <span className="wavy">What&rsquo;s</span> Your Car Worth?
            </h3>
            <p>
              Up-to-the-minute market pricing and decades of experience means you
              can rest easy.
            </p>
            <IconList
              items={[
                "Obligation fast and free, expert valuation at your door",
                "Easy, safe and fast",
                "Known & trusted by the 4CRB 89.3FM Community",
              ]}
            />
            <div className="home-actions">
              <Button to="/buy-my-car" variant="purple" arrow>
                Buy My Car
              </Button>
            </div>
          </div>
          <div className="home-split__media reveal-right">
            <img
              src="/assets/images/Adam-Hall-Buy-My-Car-1-Long.jpg"
              alt="Adam Hall shaking hands with a customer at their home"
              loading="lazy"
              width={640}
              height={480}
            />
            <img
              className="home-split__bubbles"
              src="/assets/decor/welcome-hello.svg"
              alt=""
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* Buy my car — image left, rotating hassle-free badge */}
      <section className="section bg-cream home-buy" style={{ paddingTop: 0 }}>
        <div className="container container--wide home-split home-split--media-left">
          <div className="home-split__media home-split__media--collage reveal-left">
            <img
              src="/assets/images/Adam-Hall-Value-My-Car.jpg"
              alt="Adam Hall talking with a customer through their car window"
              loading="lazy"
              width={640}
              height={480}
            />
            <img
              className="home-split__collage"
              src="/assets/images/Adam-Hall-Car-Buying-Gold-Coast.jpg"
              alt="Adam Hall helping a family sell their car"
              loading="lazy"
              width={320}
              height={240}
            />
            <img
              className="home-badge"
              src="/assets/icons/hassle-free-guarantee.svg"
              alt="Adam Hall hassle-free guarantee"
              loading="lazy"
              width={110}
              height={110}
            />
          </div>
          <div className="home-split__content reveal-right">
            <span className="eyebrow">Buy my car</span>
            <h3 className="home-split__title">
              The <span className="wavy">easiest</span> and quickest way to sell
              your car, hassle-free
            </h3>
            <p>
              Time&rsquo;s precious and life&rsquo;s busy, so we aim to make the
              process of selling your car simple and seamless.
            </p>
            <IconList
              items={[
                "We come to you",
                "Same day payment",
                "Complimentary car pickup",
              ]}
            />
            <div className="home-actions">
              <Button to="/how-it-works" variant="purple" arrow>
                How does it work?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cars for sale right now — live inventory from the marketplace */}
      <section className="section bg-cream home-cars" style={{ paddingTop: 0 }}>
        <div className="container container--wide">
          <h3 className="home-split__title reveal" style={{ textAlign: "center" }}>
            Cars for sale <span className="wavy">right now</span>
          </h3>
          {latest.length > 0 ? (
            <>
              <div className="home-cars__grid">
                {latest.map((car, i) => (
                  <CarCard key={car.id} car={car} priority={i < 2} />
                ))}
              </div>
              <div className="home-actions" style={{ justifyContent: "center" }}>
                <Button to="/cars" variant="green" arrow>
                  View all cars for sale
                </Button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ marginBottom: "1.5rem" }}>
                Fresh stock is on its way. Take a look at everything currently
                available.
              </p>
              <div className="home-actions" style={{ justifyContent: "center" }}>
                <Button to="/cars" variant="green" arrow>
                  View all cars for sale
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <WaveDivider color="green" />

      {/* Featured testimonial */}
      <FeaturedTestimonial
        photo="/assets/images/Adam-Hall-Car-Buying-Gold-Coast-1.jpg"
        photoAlt="Jen and her father at home on the couch"
        quote={heroQuote.home.quote}
        name={heroQuote.home.name}
        role={heroQuote.home.role}
      />

      <TestimonialGrid items={homeTestimonials} />

      <WaveDivider color="green" flip />

      {/* Radio / voice you trust */}
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
              <h3 className="home-split__title">
                Adam Hall, the voice you know and trust
              </h3>
              <p>
                Over the years, Adam&rsquo;s segment &ldquo;What&rsquo;s your car
                worth?&rdquo; on 4CRB 89.3FM has become the go-to trusted source
                of advice for the community.
              </p>
              <p>
                He offers this same, obligation-free service to value your car at
                home.
              </p>
              <p>All you have to do is to make a quick call to get in touch.</p>
              <IconList
                items={[
                  "Radio host on 4CRB 89.3FM ‘What’s your car worth?’",
                  "27+ years in the automotive industry",
                  "10,000 car valuations live on air and counting!",
                ]}
              />
              <div className="home-actions">
                <Button to="/buy-my-car" variant="purple" arrow>
                  Buy My Car
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
      <PurpleCta />
    </div>
  );
}
