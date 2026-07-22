/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import ValuationForm from "@/components/site/ValuationForm";
import IconList from "@/components/site/IconList";
import { TestimonialList } from "@/components/site/Testimonials";
import SiteReveal from "@/components/site/SiteReveal";
import { buyMyCarTestimonials } from "@/lib/site-data/testimonials";
import { site } from "@/lib/site-data/site";

export const metadata: Metadata = {
  title: "Adam Hall Value My Car | What's My Car Worth?",
  description:
    "Up-to-the-minute market pricing and decades of experience to help you set the right price for your car. Get a free, obligation-free valuation from Adam Hall.",
};

export default function BuyMyCarPage() {
  return (
    <div className="ah-site bmc">
      <SiteReveal />
      <header className="bmc__top">
        <Link
          href="/"
          className="bmc__logo"
          aria-label="Adam Hall Buy My Car — home"
        >
          <img
            src="/assets/logos/logo-black.svg"
            alt="Adam Hall Buy My Car"
            width={200}
            height={90}
          />
        </Link>
        <div className="bmc__featured">
          <span>Featured On</span>
          <img
            src="/assets/logos/4crb-white.png"
            alt="4CRB 89.3FM"
            width={110}
            height={55}
          />
        </div>
      </header>

      <div className="bmc__body container container--wide">
        <div className="bmc__intro reveal-left">
          <h1 className="bmc__title">
            <span className="wavy">Buy</span> my car.
          </h1>
          <p className="bmc__lead">
            Up-to-the-minute market pricing and decades of experience to help you
            set the right price for your car.
          </p>
          <IconList
            items={[
              "Known & trusted by the 4CRB 89.3FM Community",
              "Obligation-free, expert valuation",
              "Real market pricing at your doorstep",
              "Peace of mind",
              "Hassle-free guarantee",
            ]}
          />
          <hr className="bmc__rule" />
          <TestimonialList items={buyMyCarTestimonials} />
        </div>

        <div className="bmc__form reveal-right" id="valuation">
          <ValuationForm />
        </div>
      </div>

      <footer className="bmc__foot">
        <p>{site.copyright}</p>
        <Link href="/privacy-policy">Privacy Policy</Link>
      </footer>
    </div>
  );
}
