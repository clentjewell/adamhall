import type { Metadata } from "next";
import { ChatText, HandCoins, PenNib } from "@phosphor-icons/react/dist/ssr";
import { getContent } from "@/lib/content";
import FinanceCalculator from "@/components/FinanceCalculator";
import FinanceEnquiryForm from "@/components/FinanceEnquiryForm";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Finance",
  description:
    "Work out a repayment estimate and get finance sorted before you shop. No hype, no approval claims, just the numbers.",
};

const STEP_ICONS = [ChatText, HandCoins, PenNib];

export default async function FinancePage({
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
    <>
      {/* Typographic header, per the mockup: hero media stays on the home
          page, and this page opens on the calculator. */}
      <header className="max-w-6xl mx-auto px-4 pt-10">
        <p className="type-label text-forest-600">Finance</p>
        <h1 data-edit="financePage.title" className="type-heading mt-2">
          {content.financePage.title}
        </h1>
        <p data-edit="financePage.sub" className="mt-3 max-w-[52ch] text-stone-600">
          {content.financePage.sub}
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Reveal>
            <FinanceCalculator defaultPrice={defaultPrice} />
          </Reveal>
          <Reveal delay={0.08}>
            <FinanceEnquiryForm />
          </Reveal>
        </div>

        {/* Section transition: the gauge at fine scale (identity section 12). */}
        <div className="gauge-fine mt-16" aria-hidden="true" />

        <div className="mt-10">
          <h2 className="type-heading text-center mb-8">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {content.financePage.steps.map((step, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length];
              return (
                <Reveal key={step.title + i} delay={i * 0.08}>
                  <div className="text-center">
                    <Icon size={32} className="text-forest-600 mx-auto" weight="duotone" />
                    <p data-edit={`financePage.steps.${i}.title`} className="font-bold mt-3">
                      {step.title}
                    </p>
                    <p
                      data-edit={`financePage.steps.${i}.body`}
                      className="text-sm text-stone-600 mt-1 leading-relaxed"
                    >
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <p className="helper max-w-3xl mx-auto text-center mt-16 leading-relaxed">
          Figures on this page are estimates only, not an offer or approval
          of finance. Actual rates, fees and approval depend on assessment
          by the lender. Comparison rate warning:{" "}
          [legal review required for jurisdiction wording].
        </p>
      </div>
    </>
  );
}
