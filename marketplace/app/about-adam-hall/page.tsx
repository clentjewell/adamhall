/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import GreenHero from "@/components/site/GreenHero";
import StatCounter from "@/components/site/StatCounter";
import PurpleCta from "@/components/site/PurpleCta";
import SiteReveal from "@/components/site/SiteReveal";

export const metadata: Metadata = {
  title:
    "Adam Hall “What’s your car worth?” 4CRB 89.3FM | Up-to-the-minute market pricing",
  description:
    "Adam Hall has been a Gold Coast local for over 40 years and spent his entire career in the automotive industry. Read Adam’s story.",
};

const simplifyCards = [
  {
    n: "01",
    title: "A trusted guide",
    body: "We guide you with helpful, free, expert advice built on decades of experience for peace of mind.",
  },
  {
    n: "02",
    title: "Happy customers",
    body: "Get the result you want with a heartfelt handshake, warm smile and the help you need.",
  },
  {
    n: "03",
    title: "Hassle-free",
    body: "We keep the process easy and convenient. Because you've got better things to do with your time.",
  },
];

const values = [
  {
    title: "Customer-centric",
    body: "Happy customers are our lifeblood, so we strive to make everything we do as easy as possible.",
  },
  {
    title: "Break the mould",
    body: "Holding ourselves to the highest standards of integrity, we hope to be like an old friend, and look after you the same way we would a family member.",
  },
  { title: "Open & honest", body: "We speak openly, honestly and respectfully." },
  { title: "Welcoming", body: "We humbly seek to serve you." },
];

export default function AboutAdamHallPage() {
  return (
    <div className="ah-site">
      <SiteReveal />
      <GreenHero
        title={
          <>
            Adam&rsquo;s <span className="wavy">story.</span>
          </>
        }
        subtitle="Adam Hall has been serving the community for almost three decades."
        bridgeImage="/assets/images/Adam-Hall-Gold-Coast.jpg"
        bridgeAlt="Adam Hall standing in a doorway at home on the Gold Coast"
        bridgeBg="cream"
      />

      {/* Bio */}
      <section className="section bg-cream" style={{ paddingTop: 0 }}>
        <div className="container container--narrow about-bio reveal">
          <h3 className="wavy about-bio__title">Bio</h3>
          <p>
            Adam has been a Gold Coast local for over 40 years and has spent his
            entire career in the automotive industry.
          </p>
          <p>
            He became a dealer principal and shareholder of his own dealership and
            has represented major manufacturers including Toyota, Ford, Holden,
            Honda, Mitsubishi, KIA, and Suzuki, to name a few.
          </p>
          <p>
            In 2010, Adam was invited to present a live radio show called{" "}
            <em>What&rsquo;s Your Car Worth</em> on 89.3 4CRB FM.
          </p>
          <p>From day one, the show was well received by the local community.</p>
          <p>
            To date, Adam has provided over 10,000 car valuations to residents of
            the Gold Coast and surrounding area residents.
          </p>
          <p>Amazingly, these were all live on air.</p>
          <p>
            His segment is often said to be the fastest 30 minutes in radio; there
            is always a high volume of callers, keen to seek Adam&rsquo;s advice.
          </p>
          <p>Adam insists on providing open and transparent information to listeners.</p>
          <p>
            It is typical of his approach generally, without all the fuss normally
            associated with buying and selling cars.
          </p>
          <p>
            After listening to and speaking with thousands of callers over the
            years live on air, Adam discovered that many people just wanted a
            simple solution to selling their car that avoids the pitfalls, the
            &lsquo;tyre kickers&rsquo; and the hassle of selling privately or
            trading it in through a dealership.
          </p>
          <p>
            Adam spent a lot of time thinking about this feedback and decided to
            create a car buying service for the local community that was:
          </p>
          <ul className="about-bio__list">
            <li>Stress-free</li>
            <li>Convenient</li>
            <li>Easy</li>
            <li>Safe</li>
            <li>
              Super fast (you can receive payment the same day, though we usually
              allow 24 hours)
            </li>
          </ul>
          <p>
            Hundreds of customers have sold their car to Adam, and the positive
            feedback continues to be outstanding.
          </p>
          <p>
            Adam is incredibly grateful for the community support for this new
            business.
          </p>
          <p className="about-bio__from">From Adam:</p>
          <blockquote className="about-bio__quote">
            &ldquo;I am incredibly grateful for the community support for my new
            business and look forward to assisting many more people in the
            future.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Simplify cards */}
      <section className="section bg-cream" style={{ paddingTop: 0 }}>
        <div className="container container--wide">
          <h4 className="about-simplify__title reveal">
            Let Adam simplify the car sales process for you.
          </h4>
          <div className="about-cards">
            {simplifyCards.map((c) => (
              <div className="about-card reveal" key={c.n}>
                <span className="about-card__n">{c.n}</span>
                <h5>{c.title}</h5>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* By the numbers */}
      <section className="section bg-green about-numbers">
        <div className="container container--wide reveal">
          <h3 className="about-numbers__title">
            By the <span className="wavy wavy--white">numbers</span>
          </h3>
          <StatCounter
            stats={[
              {
                end: 10000,
                suffix: "+",
                title: "Cars Valued Live on Air",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />
                  </svg>
                ),
              },
              {
                end: 1000,
                suffix: "+",
                title: "Happy Customers",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s-7-4.6-9.5-8.5C.6 9.2 2.4 5.5 6 5.5c2 0 3.3 1 4 2 .7-1 2-2 4-2 3.6 0 5.4 3.7 3.5 7-2.5 3.9-9.5 8.5-9.5 8.5z" />
                    <path d="M7 12l2.5-2 2 1.5L14 9.5l2 1.5" />
                  </svg>
                ),
              },
              {
                end: 3000000,
                prefix: "$",
                suffix: "+",
                title: "Dollars in cars sold to Adam this year!",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9.5" />
                    <path d="M12 6.5v11M15 8.8c-.7-1-1.8-1.4-3-1.4-1.7 0-3 .9-3 2.3 0 2.9 6 1.7 6 4.6 0 1.4-1.3 2.3-3 2.3-1.2 0-2.3-.4-3-1.4" />
                  </svg>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* Values */}
      <section className="section bg-cream">
        <div className="container container--wide about-values">
          <div className="about-values__media reveal-left">
            <img
              src="/assets/images/Adam-Hall-Value-My-Car-2.jpg"
              alt="Adam Hall with a customer and their car"
              loading="lazy"
              width={560}
              height={520}
            />
          </div>
          <div className="about-values__content reveal-right">
            <h3>
              Some of the <span className="wavy">values</span> we hold deeply
            </h3>
            <dl className="about-values__list">
              {values.map((v) => (
                <div key={v.title}>
                  <dt>{v.title}</dt>
                  <dd>{v.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <PurpleCta />
    </div>
  );
}
