import type { Metadata } from "next";
import { ChatText, HandCoins, PenNib } from "@phosphor-icons/react/dist/ssr";
import { pageHeroImages, pageHeroVideos } from "@/lib/heroes";
import { getContent } from "@/lib/content";
import PageHero from "@/components/PageHero";
import FinanceCalculator from "@/components/FinanceCalculator";
import FinanceEnquiryForm from "@/components/FinanceEnquiryForm";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Finance",
  description:
    "Work out a repayment estimate and get finance sorted before you shop — no hype, no approval claims, just the numbers.",
};

const STEP_ICONS = [ChatText, HandCoins, PenNib];

export default async function FinancePage() {
  const content = await getContent();

  return (
    <>
      <PageHero
        image={pageHeroImages.finance}
        video={pageHeroVideos.finance}
        imageAlt="Adam at his desk, ready to talk finance"
        title={content.financePage.title}
        titleEditPath="financePage.title"
      >
        <p data-edit="financePage.sub" className="text-stone-200 max-w-[52ch] text-lg">
          {content.financePage.sub}
        </p>
      </PageHero>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Reveal>
            <FinanceCalculator />
          </Reveal>
          <Reveal delay={0.08}>
            <FinanceEnquiryForm />
          </Reveal>
        </div>

        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl text-center mb-8">How it works</h2>
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
          Figures on this page are estimates only — not an offer or approval
          of finance. Actual rates, fees and approval depend on assessment
          by the lender. Comparison rate warning:{" "}
          [legal review required for jurisdiction wording].
        </p>
      </div>
    </>
  );
}
