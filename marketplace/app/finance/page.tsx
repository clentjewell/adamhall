import type { Metadata } from "next";
import { ChatText, HandCoins, PenNib } from "@phosphor-icons/react/dist/ssr";
import { heroImages } from "@/lib/heroes";
import PageHero from "@/components/PageHero";
import FinanceCalculator from "@/components/FinanceCalculator";
import FinanceEnquiryForm from "@/components/FinanceEnquiryForm";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Finance",
  description:
    "Work out a repayment estimate and get finance sorted before you shop — no hype, no approval claims, just the numbers.",
};

const HOW_IT_WORKS = [
  {
    icon: ChatText,
    title: "Tell us the number",
    body: "Run the calculator, then send through the amount and your details. Two minutes, no paperwork yet.",
  },
  {
    icon: HandCoins,
    title: "We shop it to our lenders",
    body: "[finance model to be confirmed: in-house / broker] — either way, we come back with a real rate, not a teaser.",
  },
  {
    icon: PenNib,
    title: "You sign when the rate's right",
    body: "No pressure to take it. If the number works for you, we settle the paperwork and you drive away.",
  },
];

export default function FinancePage() {
  return (
    <>
      <PageHero
        image={heroImages.cars}
        imageAlt="Keys resting on a finance paperwork folder"
        title="Finance that's sorted before you shop"
      >
        <p className="text-stone-200 max-w-[52ch] text-lg">
          Get a feel for the repayments first, then send us the numbers.
          We&apos;ll tell you straight what&apos;s realistic. No guesswork,
          no approval promises until a lender&apos;s actually looked at it.
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
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <div className="text-center">
                  <step.icon size={32} className="text-forest-600 mx-auto" weight="duotone" />
                  <p className="font-bold mt-3">{step.title}</p>
                  <p className="text-sm text-stone-600 mt-1 leading-relaxed">{step.body}</p>
                </div>
              </Reveal>
            ))}
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
