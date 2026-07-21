import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MagnifyingGlass,
  SteeringWheel,
  HandCoins,
  CalendarCheck,
  SealCheck,
  ClipboardText,
  IdentificationCard,
  Phone,
} from "@phosphor-icons/react/dist/ssr";
import PageHero from "@/components/PageHero";
import { heroImages, aboutHeroVideo } from "@/lib/heroes";
import { getContent } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Adam Hall. One bloke, one yard, every car picked, checked and priced by hand. No sales team, no head office, no games.",
};

const buyingSteps = [
  {
    icon: MagnifyingGlass,
    title: "Look",
    body: "Come by the yard or browse the listings. Every photo and every word on the page is the actual car.",
  },
  {
    icon: SteeringWheel,
    title: "Drive",
    body: "Take it for a proper drive. Bring your own mechanic if you want a second opinion, though most people don't need to.",
  },
  {
    icon: HandCoins,
    title: "A straight answer on price",
    body: "The number on the car is the number you pay. No add-ons, no last-minute extras at the desk.",
  },
  {
    icon: CalendarCheck,
    title: "Settle same day",
    body: "Paperwork done properly and the car is yours the same day it clears.",
  },
];

const trustPoints = [
  {
    icon: SealCheck,
    title: "PPSR checked, every car",
    body: "No money owing, not written off, not stolen. Checked before it ever goes on the lot.",
  },
  {
    icon: ClipboardText,
    title: "Honest condition reports",
    body: "Faults get written down, not hidden. If something needs work, you'll know before you buy.",
  },
  {
    icon: IdentificationCard,
    title: "Licensed dealer",
    body: "Dealer licence number [licence number pending].",
  },
  {
    icon: Phone,
    title: "Real contact details",
    body: "A real person answers the phone. See the Contact page for how to reach Adam directly.",
  },
];

export default async function AboutPage() {
  const content = await getContent();
  const [firstSection, secondSection, ...restSections] = content.about.sections;

  return (
    <>
      <PageHero
        image={heroImages.home}
        imageAlt="Adam Hall on the forecourt"
        video={aboutHeroVideo}
        title={content.about.title}
        titleEditPath="about.title"
      >
        <p data-edit="about.sub" className="text-stone-200 max-w-[56ch] text-lg">
          {content.about.sub}
        </p>
      </PageHero>

      {/* How Adam works */}
      {firstSection && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <Reveal>
            <h2 data-edit="about.sections.0.heading" className="font-display font-bold text-2xl md:text-3xl">
              {firstSection.heading}
            </h2>
            <p data-edit="about.sections.0.body" className="mt-4 text-stone-600 leading-relaxed max-w-[65ch]">
              {firstSection.body}
            </p>
          </Reveal>
        </section>
      )}

      {/* Buying process */}
      <section className="border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <Reveal>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-8">
              Buying from us
            </h2>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {buyingSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <div>
                  <step.icon size={28} className="text-forest-600" weight="duotone" />
                  <p className="font-bold mt-3">{step.title}</p>
                  <p className="text-sm text-stone-600 mt-1 leading-relaxed">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Selling process */}
      {secondSection && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <Reveal>
            <div className="card p-8 md:p-10 bg-forest-50/60 !border-forest-100 md:flex items-center justify-between gap-8">
              <div>
                <h2 data-edit="about.sections.1.heading" className="font-display font-bold text-2xl md:text-3xl">
                  {secondSection.heading}
                </h2>
                <p data-edit="about.sections.1.body" className="mt-3 text-stone-600 leading-relaxed max-w-[52ch]">
                  {secondSection.body}
                </p>
              </div>
              <Link href="/sell" className="btn-primary mt-6 md:mt-0 shrink-0">
                Sell your car
                <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* Any additional about sections an admin has added */}
      {restSections.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16 space-y-10">
          {restSections.map((section, i) => {
            const idx = i + 2;
            return (
              <Reveal key={section.heading + i} delay={i * 0.06}>
                <h2 data-edit={`about.sections.${idx}.heading`} className="font-display font-bold text-2xl md:text-3xl">
                  {section.heading}
                </h2>
                <p data-edit={`about.sections.${idx}.body`} className="mt-4 text-stone-600 leading-relaxed max-w-[65ch]">
                  {section.body}
                </p>
              </Reveal>
            );
          })}
        </section>
      )}

      {/* Trust strip */}
      <section className="border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <Reveal>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-8">
              Why people trust the deal
            </h2>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point, i) => (
              <Reveal key={point.title} delay={i * 0.08}>
                <div className="flex gap-3.5">
                  <point.icon size={26} className="text-forest-600 shrink-0" weight="fill" />
                  <div>
                    <p className="font-bold text-sm">{point.title}</p>
                    <p className="text-sm text-stone-600 mt-1 leading-relaxed">{point.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <Reveal>
          <div className="card !border-forest-700 bg-forest-800 text-white p-8 md:p-12 md:flex items-center justify-between gap-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl">
                Ready to have a look?
              </h2>
              <p className="mt-3 text-forest-100 max-w-[52ch] leading-relaxed">
                Browse what's on the lot now, or get a straight number on your
                own car.
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-wrap gap-3 shrink-0">
              <Link href="/cars" className="btn bg-white text-forest-800 hover:bg-forest-50 px-6 py-3">
                Browse the cars
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link
                href="/sell"
                className="btn border-2 border-white/70 text-white hover:bg-white/10 px-6 py-3"
              >
                Sell your car
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
