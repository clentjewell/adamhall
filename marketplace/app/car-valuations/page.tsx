import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "next-view-transitions";
import {
  ArrowRight,
  BookOpen,
  ChartLineUp,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { getContent } from "@/lib/content";
import { getResponseStat } from "@/lib/stats";
import { pageHeroImages } from "@/lib/heroes";
import InstantQuote from "@/components/sell/InstantQuote";

export const metadata: Metadata = {
  // Seller-side, like /sell. Held out of the index so it does not compete
  // with the same tool on adamhallbuymycar.com.au once that lands. Revisit
  // when the domain split is finished and one site owns the sell side.
  robots: { index: false, follow: true },
  title: "What's my car worth?",
  description:
    "Get an instant indicative range on your car, worked out from cars we have actually bought and sold. No account and no phone number needed to see the number.",
};

export default async function CarValuationsPage() {
  const [content, stat] = await Promise.all([getContent(), getResponseStat()]);

  return (
    <>
      {/* A band, not the sitewide full-height hero. This page is a tool, and
          a 100dvh hero put every field of it below the fold — the visitor had
          to scroll before they could start the thing they came to do. The
          photo still sets the scene; it just does not hold the door shut. */}
      <section className="relative isolate overflow-hidden bg-forest-700">
        <Image
          src={pageHeroImages.sell}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_42%]"
        />
        {/* Heavy on the left where the words sit, clearing to nothing on the
            right so the photograph is actually visible rather than a green
            wash with a shape in it. */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-forest-800 via-forest-800/85 to-forest-800/20"
          aria-hidden="true"
        />
        <div className="page-shell relative py-12 sm:py-16">
          <h1 className="type-hero text-white">What&apos;s my car worth?</h1>
          <p className="type-lead mt-3 max-w-[46ch] text-stone-200">
            Tell us about the car and see the range it sits in, straight away.
            The real offer comes from us
            {stat ? `, usually ${stat.label}` : ""}.
          </p>
        </div>
      </section>

      {/* Less top padding than a full section step: the band above already
          carries its own, and a full step on top of it left the tool floating
          in the middle of the page. */}
      <div className="page-shell pt-10 pb-[var(--rhythm-section)] sm:pt-12">
        <InstantQuote phone={content.phone} />

        {/* How the number is arrived at. The brand's whole promise is that
            nothing is hidden, so the method is on the page, not in a tooltip. */}
        {/* The method, on the page rather than in a tooltip: the brand's whole
            promise is that nothing is hidden.

            The three headings used to be 11px uppercase labels under a 40px
            h2 — a 29px jump between a heading and the headings it introduces,
            with nothing in between. They are card titles now, one step below
            the section heading, which is itself the Subheading rather than
            the page-level Heading: this is a section of the page, not the
            page. */}
        <section className="mt-16 border-t border-hairline pt-12">
          <h2 className="type-subheading text-center">
            How we work the number out
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              {
                Icon: BookOpen,
                title: "Our own book",
                body: "We start with cars we have bought and sold ourselves, not a national average.",
              },
              {
                Icon: ChartLineUp,
                title: "Measured against yours",
                body: "Those cars are corrected for your year, odometer, condition and service history.",
              },
              {
                Icon: ShieldCheck,
                title: "We say when we cannot",
                body: "No car like yours through recently, and we say so rather than invent a figure.",
              },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="card p-6">
                <span
                  className="grid h-12 w-12 place-items-center rounded-full bg-forest-600 text-white"
                  aria-hidden="true"
                >
                  <Icon size={22} weight="fill" />
                </span>
                <h3 className="type-card-title mt-4">{title}</h3>
                <p className="mt-2 text-stone-600">{body}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-[65ch] text-pretty text-center text-stone-600">
            We quote a range rather than one figure because two cars of the same
            year and odometer can be thousands apart once we have looked at the
            tyres, the book and the panels. The narrower the range, the more cars
            like yours we have to go on.
          </p>
        </section>

        <section className="mt-12">
          {/* Words left, actions right. Stacked, the copy ran to 55 characters
              and left half the card empty beside it. */}
          <div className="card flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {/* Was a hardcoded 28px, which is the Subheading size written out
                  by hand — same result, one more number nobody can find later. */}
              <h2 className="type-subheading">Rather just talk it through?</h2>
              <p className="mt-2 max-w-[52ch] text-stone-600">
                One number, one person on the phone. A call often beats a form.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
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
