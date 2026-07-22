import type { Metadata } from "next";
import { privacyBlocks } from "@/lib/site-data/privacy";
import SiteReveal from "@/components/site/SiteReveal";

export const metadata: Metadata = {
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
