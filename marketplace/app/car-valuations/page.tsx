import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getContent } from "@/lib/content";
import { getResponseStat } from "@/lib/stats";
import { pageHeroImages, pageHeroVideos } from "@/lib/heroes";
import PageHero from "@/components/PageHero";
import InstantQuote from "@/components/sell/InstantQuote";

export const metadata: Metadata = {
  // Seller-side, like /sell. Held out of the index so it does not compete
  // with the same tool on adamhallbuymycar.com.au once that lands. Revisit
  // when the domain split is finished and one site owns the sell side.
  robots: { index: false, follow: true },
  title: "What's my car worth?",
  description:
    "Get an instant indicative range on your car, worked out from cars Adam Hall has actually bought and sold. No account and no phone number needed to see the number.",
};

export default async function CarValuationsPage() {
  const [content, stat] = await Promise.all([getContent(), getResponseStat()]);

  return (
    <>
      <PageHero
        image={pageHeroImages.sell}
        video={pageHeroVideos.sell}
        imageAlt="Adam checking over a car's engine"
        title="What's my car worth?"
      >
        <p className="max-w-[52ch] text-lg text-stone-200">
          Tell us about the car and we will show you the range it sits in, before
          you give us a single contact detail. The real offer comes from Adam
          {stat ? `, usually ${stat.label}` : ""}.
        </p>
      </PageHero>

      <div className="page-shell py-12">
        <InstantQuote phone={content.phone} />

        {/* How the number is arrived at. The brand's whole promise is that
            nothing is hidden, so the method is on the page, not in a tooltip. */}
        <section className="mt-16 border-t border-hairline pt-10">
          <h2 className="type-heading">
            How we work the number out
          </h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            <div>
              <p className="type-label text-meta">
                Adam&apos;s own book
              </p>
              <p className="mt-2">
                The range comes from cars Adam has bought and sold himself.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-meta">
                Measured against yours
              </p>
              <p className="mt-2">
                We line those cars up against yours and correct for year,
                odometer, condition and service history before quoting anything.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-meta">
                We say when we cannot
              </p>
              <p className="mt-2">
                If we have not had a car like yours through recently, we say so
                instead of inventing a figure, and Adam takes it from there.
              </p>
            </div>
          </div>

          <p className="mt-8 max-w-[65ch] text-sm text-meta">
            We quote a range rather than one figure because two cars of the same
            year and odometer can be thousands apart once Adam has looked at the
            tyres, the book and the panels. The narrower the range, the more cars
            like yours we have to go on.
          </p>
        </section>

        <section className="mt-12">
          <div className="card p-6 sm:p-8">
            <h2 className="text-[28px] font-extrabold leading-[1.2]">
              Rather just talk it through?
            </h2>
            <p className="mt-2 max-w-[55ch]">
              One number, one person. Adam has valued more than 10,000 cars on
              air, so a call often beats a form.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href={content.phone.tel} className="btn-primary">
                Call {content.phone.display}
              </a>
              <Link href="/sell" className="btn-secondary">
                Send the car through
                <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
