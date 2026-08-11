import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import FinanceCalculatorV2 from "@/components/site/FinanceCalculatorV2";
import FinanceEnquiryForm from "@/components/FinanceEnquiryForm";
import SiteReveal from "@/components/site/SiteReveal";

/**
 * Redesigned finance page (route: /finance2), built to the "Carmarketplace UI
 * mockups" artifact, frame 1g.
 *
 * Copy stays CMS-editable through getContent (same data-edit hooks as
 * /finance), the repayment maths stays in lib/finance.ts, and the real
 * FinanceEnquiryForm — with its server action — is kept below the calculator
 * so "Get a real quote" still leads somewhere.
 */
export const metadata: Metadata = {
  title: "Finance",
  description:
    "Work out a repayment estimate and get finance sorted before you shop. No hype, no approval claims, just the numbers.",
  // Out of the index while it runs alongside the live finance page.
  robots: { index: false, follow: false },
};

export default async function Finance2Page({
  searchParams,
}: {
  searchParams: Promise<{ price?: string }>;
}) {
  const [content, { price }] = await Promise.all([getContent(), searchParams]);
  // "Estimate yours" on a car page arrives with that car's price in the URL,
  // so the calculator opens on the car being considered.
  const parsedPrice = Number(price);
  const defaultPrice =
    Number.isFinite(parsedPrice) && parsedPrice >= 5000 && parsedPrice <= 500000
      ? Math.round(parsedPrice)
      : undefined;

  return (
    <div className="ah-site mp-finance2">
      <SiteReveal />

      {/* Dark band, per the artifact: the page states what it is, then the
          calculator card rides up over the join. */}
      <section className="mp2-fin-hero">
        <div className="container container--wide">
          <p className="eyebrow">Finance</p>
          <h1 data-edit="financePage.title" className="mp2-fin-hero__title">
            {content.financePage.title}
          </h1>
          <p data-edit="financePage.sub" className="mp2-fin-hero__sub">
            {content.financePage.sub}
          </p>
        </div>
      </section>

      <div className="container container--wide mp2-fin-calc">
        <FinanceCalculatorV2 defaultPrice={defaultPrice} />
      </div>

      {/* How it works — three numbered cards from the CMS steps. */}
      <section className="container container--wide mp2-fin-steps">
        <div className="mp2-fin-steps__grid">
          {content.financePage.steps.map((step, i) => (
            <div key={step.title + i} className="mp2-fin-step">
              <p className="mp2-fin-step__num">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3
                data-edit={`financePage.steps.${i}.title`}
                className="mp2-fin-step__title"
              >
                {step.title}
              </h3>
              <p
                data-edit={`financePage.steps.${i}.body`}
                className="mp2-fin-step__body"
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The actual lead. The artifact's "Get a real quote" button targets
          this, so the CTA is not a dead end. */}
      <section className="container container--wide mp2-fin-quote" id="finance-quote">
        <div className="mp2-fin-quote__inner">
          <div className="mp2-fin-quote__intro">
            <h2 className="mp2-fin-quote__title">Get a real quote</h2>
            <p>
              Send the numbers through and we&rsquo;ll come back with a rate a
              lender will actually stand behind. No credit check until you say
              go.
            </p>
          </div>
          <FinanceEnquiryForm defaultAmount={defaultPrice} />
        </div>
        <p className="mp2-fin-legal">
          Figures on this page are estimates only, not an offer or approval of
          finance. Actual rates, fees and approval depend on assessment by the
          lender. Comparison rate warning: [legal review required for
          jurisdiction wording].
        </p>
      </section>
    </div>
  );
}
