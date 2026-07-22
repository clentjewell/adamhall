import type { Metadata } from "next";
import FaqSection from "@/components/site/FaqSection";
import PurpleCta from "@/components/site/PurpleCta";
import ContactForm from "@/components/site/ContactForm";
import SiteReveal from "@/components/site/SiteReveal";
import { site } from "@/lib/site-data/site";

export const metadata: Metadata = {
  title: "Contact Adam Hall",
  description:
    "Get in touch with Adam Hall for a free, obligation-free car valuation. Servicing the Gold Coast, Brisbane & Northern Rivers. Call 0404 290 617.",
};

export default function ContactUsPage() {
  return (
    <div className="ah-site">
      <SiteReveal />
      <section className="bg-green contact-hero">
        <div className="container container--wide contact-hero__inner">
          <div className="contact-hero__content reveal-left">
            <h1 className="contact-hero__title">Got Questions?</h1>
            <p className="contact-hero__subtitle">
              I&rsquo;m here to help. Give me a call or fill in the form below and
              I will get back to you asap.
            </p>
            <a className="contact-hero__phone" href={site.phoneHref}>
              <span aria-hidden="true">☎</span> {site.phoneDisplay}
            </a>
          </div>
          <div className="contact-hero__form reveal-right">
            <ContactForm />
          </div>
        </div>
      </section>

      <FaqSection />
      <PurpleCta />
    </div>
  );
}
