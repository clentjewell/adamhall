import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import ContactForm from "@/components/site/ContactForm";
import SiteReveal from "@/components/site/SiteReveal";
import { site } from "@/lib/site-data/site";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Get in touch for a free, obligation-free car valuation. Servicing the Gold Coast, Brisbane & Northern Rivers. Call 0404 290 617.",
};

/**
 * The contact page (route: /contact-us), built to the "Carmarketplace
 * UI mockups" artifact, frame 1k.
 *
 * The artifact replaces the film hero with a two-column layout: the phone
 * number set as the largest thing on the page on the left, the message form
 * on the right. ContactForm is reused untouched, so the same validation and
 * the same submitContactMessage server action are behind it.
 */
export default function ContactUs2Page() {
  return (
    <div className="ah-site mp-contact2">
      <SiteReveal />

      <div className="container container--wide mp2-contact">
        <div className="mp2-contact__intro">
          <p className="eyebrow">Contact</p>
          <h1 className="mp2-contact__title">
            The number goes straight to the yard
          </h1>
          <p className="mp2-contact__sub">
            No call centre, no ticket number. If we&rsquo;re under a car
            we&rsquo;ll ring you back.
          </p>

          <a href={site.phoneHref} className="mp2-contact__phonelink">
            <span className="eyebrow">Phone</span>
            <span className="mp2-contact__phone">{site.phoneDisplay}</span>
          </a>

          <div className="mp2-contact__facts">
            <div>
              <p className="eyebrow">Where we operate</p>
              <p>
                {site.serviceAreas}. Cars are viewed by appointment.
              </p>
            </div>
            <div>
              <p className="eyebrow">Hours</p>
              <p>
                Mon&ndash;Sat, 7am&ndash;6pm
                <br />
                Sunday by arrangement
              </p>
            </div>
          </div>

          <p className="mp2-contact__more">
            Chasing something specific?{" "}
            <Link href="/faq">Read the common questions</Link> &mdash; most
            answers are already there.
          </p>
        </div>

        <div className="mp2-contact__panel">
          <h2 className="mp2-contact__panel-title">Send a message</h2>
          <p className="mp2-contact__panel-sub">
            Usually answered within a couple of hours during the day.
          </p>
          <ContactForm />
          <p className="mp2-contact__privacy">
            We only use your details to answer this enquiry. Nothing gets sold
            on.
          </p>
        </div>
      </div>
    </div>
  );
}
