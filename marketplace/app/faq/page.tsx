import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { heroImages } from "@/lib/heroes";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Straight answers to the questions we get asked most, about buying, selling and the paperwork in between.",
};

interface Faq {
  q: string;
  a: string;
}

const buying: Faq[] = [
  {
    q: "Are the prices negotiable?",
    a: "The price is the price. We cut the haggle out, not corners. Every car is priced to sell from the start, so there's no invisible markup sitting there waiting for you to talk it down.",
  },
  {
    q: "What's a PPSR check, and why does it matter?",
    a: "PPSR stands for Personal Property Securities Register. It tells you whether a car has money owing on it, has been written off, or is reported stolen. Every car on this lot is PPSR checked before it's listed, and the certificate is available on request.",
  },
  {
    q: "Can I test drive a car before I buy it?",
    a: "Yes, always. Bring your licence and take it for a proper drive. If you want your own mechanic to look it over first, that's fine too. Most buyers don't need to, but it's your money.",
  },
  {
    q: "Do you offer any kind of warranty?",
    a: "[statutory warranty wording pending legal review]. Ask what applies to the specific car you're looking at before you commit.",
  },
  {
    q: "Is there a deposit or holding policy?",
    a: "[deposit terms pending, confirmed at time of sale]. Ask when you're ready to go ahead and we'll walk you through it.",
  },
  {
    q: "Can I get a mechanical inspection done separately?",
    a: "Of course. Take the car to your own mechanic or an independent inspector before you buy. A car worth buying is a car worth checking.",
  },
];

const selling: Faq[] = [
  {
    q: "Can I sell my car without buying one?",
    a: "Yes. Plenty of people just want to sell and walk away with cash, no trade needed. Send through your rego and a few photos and Adam will look at it the same way either way.",
  },
  {
    q: "How fast will I actually get paid?",
    a: "Adam personally reviews every car and comes back with a real offer within one business day. If you accept, settlement happens the same day the paperwork clears — usually that day or the next.",
  },
  {
    q: "Do you take trade-ins?",
    a: "Yes. If you're buying a car and selling one at the same time, tell us upfront and we'll value both at once.",
  },
  {
    q: "What if my car isn't perfect — high kms, a dent, no books?",
    a: "Tell us straight up. It won't stop us making an offer, it just affects the number. We'd rather know before we look at it than find out standing in your driveway.",
  },
  {
    q: "Do you buy cars that still have finance owing?",
    a: "Often, yes. Tell us the payout figure when you send through your details and we'll factor it into the offer and handle the payout as part of settlement.",
  },
];

const finance: Faq[] = [
  {
    q: "Can you help me get finance?",
    a: "We can point you toward finance options and give you a rough idea of repayments, but the loan itself comes from the lender, not from us.",
  },
  {
    q: "Are the finance numbers on the site a real offer?",
    a: "No. Finance estimates on this site are estimates only, not an offer or a pre-approval. Actual rates and repayments depend on the lender's own criteria and your circumstances.",
  },
  {
    q: "What paperwork do I need to bring when I buy?",
    a: "Your driver's licence, and if you're financing, whatever your lender asks for. If you're trading in or selling, bring the rego papers and, if it's financed, your payout figure.",
  },
];

const groups = [
  { title: "Buying", items: buying },
  { title: "Selling", items: selling },
  { title: "Finance & paperwork", items: finance },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  ),
};

export default function FaqPage() {
  return (
    <>
      <PageHero image={heroImages.home} imageAlt="Cars lined up on the yard" title="Questions, answered straight">
        <p className="text-stone-200 max-w-[56ch] text-lg">
          The stuff people ask most, before they ever ring us.
        </p>
      </PageHero>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-14">
        {groups.map((group) => (
          <Reveal key={group.title}>
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl mb-5">
                {group.title}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <details key={item.q} className="card group">
                    <summary className="font-semibold cursor-pointer p-4 list-none flex items-center justify-between gap-4">
                      {item.q}
                      <span className="text-forest-600 shrink-0 transition-transform group-open:rotate-45 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <p className="p-4 pt-0 text-stone-600 leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
