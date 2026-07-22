import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { pageHeroImages, pageHeroVideos } from "@/lib/heroes";
import { getContent } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Straight answers to the questions we get asked most, about buying, selling and the paperwork in between.",
};

export default async function FaqPage() {
  const content = await getContent();
  const { items } = content.faq;

  // Group items by their `group` field, preserving first-seen order so the
  // admin's editing order controls the page layout.
  const groupNames: string[] = [];
  for (const item of items) {
    if (!groupNames.includes(item.group)) groupNames.push(item.group);
  }
  const groups = groupNames.map((name) => ({
    title: name,
    items: items
      .map((item, idx) => ({ ...item, idx }))
      .filter((item) => item.group === name),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <PageHero
        image={pageHeroImages.faq}
        video={pageHeroVideos.faq}
        imageAlt="Adam in the driveway"
        title={content.faq.title}
        titleEditPath="faq.title"
      >
        <p data-edit="faq.sub" className="text-stone-200 max-w-[56ch] text-lg">
          {content.faq.sub}
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
                {group.items.map((item, i) => (
                  <details key={group.title + i} className="card group">
                    <summary className="font-semibold cursor-pointer p-4 list-none flex items-center justify-between gap-4">
                      <span data-edit={`faq.items.${item.idx}.q`}>{item.q}</span>
                      <span className="text-forest-600 shrink-0 transition-transform group-open:rotate-45 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <p data-edit={`faq.items.${item.idx}.a`} className="p-4 pt-0 text-stone-600 leading-relaxed">
                      {item.a}
                    </p>
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
