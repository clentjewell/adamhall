import type { Metadata } from "next";
import { privacyBlocks } from "@/lib/site-data/privacy";
import SiteReveal from "@/components/site/SiteReveal";

export const metadata: Metadata = {
  // Parent-brand seller page, kept reachable but off the buy-side nav.
  // Out of the index so it cannot compete with the same content on
  // adamhallbuymycar.com.au. follow:true so the links out still carry.
  robots: { index: false, follow: true },
  title: "Privacy Policy | Adam Hall Buy My Car",
  description:
    "Adam Hall Buy My Car privacy policy — how we collect, use, disclose, store and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="ah-site">
      <SiteReveal />
      <section className="bg-green privacy-hero">
        <div className="container container--narrow">
          <h1>Privacy Policy</h1>
        </div>
      </section>

      <section className="section bg-cream">
        <article className="container container--narrow privacy-body reveal">
          {privacyBlocks.map((b, i) =>
            b.type === "h" ? <h2 key={i}>{b.text}</h2> : <p key={i}>{b.text}</p>,
          )}
        </article>
      </section>
    </div>
  );
}
