import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { getContent } from "@/lib/content";
import { site } from "@/lib/site-data/site";
import FaqAccordionV2 from "@/components/site/FaqAccordionV2";
import SiteReveal from "@/components/site/SiteReveal";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Straight answers to the questions we get asked most, about buying, selling and the paperwork in between.",
};

/**
 * The FAQ page (route: /faq), built to the "Carmarketplace UI mockups"
 * artifact, frame 1j.
 *
 * The artifact drops the hero film and the group headings for a single
 * typographic column with a sticky "still not sure?" rail beside it. Content
 * still comes from getContent, keeps its data-edit hooks, and the FAQPage
 * JSON-LD is preserved so the answers stay eligible for rich results.
 *
 * Groups are flattened here because the artifact runs one continuous list;
 * the group name is kept on each item's data so nothing is lost in the CMS.
 */
export default async function Faq2Page() {
  const content = await getContent();
  const items = content.faq.items.map((item, idx) => ({ ...item, idx }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="ah-site mp-faq2">
      <SiteReveal />

      <div className="container container--wide mp2-faq">
        <div className="mp2-faq__main">
          <p className="eyebrow">Questions &amp; answers</p>
          <h1 data-edit="faq.title" className="mp2-faq__title">
            {content.faq.title}
          </h1>
          <p data-edit="faq.sub" className="mp2-faq__sub">
            {content.faq.sub}
          </p>
          <FaqAccordionV2 items={items} />
        </div>

        <aside className="mp2-faq__aside">
          <div className="mp2-faq__card">
            <h2 className="mp2-faq__card-title">Still not sure?</h2>
            <p>
              Ring Adam. He answers his own phone, and he&rsquo;d rather talk it
              through than have you guess.
            </p>
            <a href={site.phoneHref} className="btn btn--green mp2-faq__cta">
              {site.phoneDisplay}
            </a>
            <Link href="/contact-us" className="btn btn--outline-green mp2-faq__cta">
              Send a message
            </Link>
          </div>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
