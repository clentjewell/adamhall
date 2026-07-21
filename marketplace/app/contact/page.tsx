import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  EnvelopeSimple,
  MapPin,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import PageHero from "@/components/PageHero";
import { pageHeroImages, pageHeroVideos } from "@/lib/heroes";
import { getContent } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to Adam directly. Phone, email or in person on the yard in Northern NSW, on the Tweed–Gold Coast border.",
};

const PHONE_HREF = "tel:+61400000000";
const PHONE_LABEL = "0400 000 000";

export default async function ContactPage() {
  const content = await getContent();

  return (
    <>
      <PageHero
        image={pageHeroImages.contact}
        video={pageHeroVideos.contact}
        imageAlt="Adam, ready to help"
        title={content.contact.title}
        titleEditPath="contact.title"
      >
        <p data-edit="contact.sub" className="text-stone-200 max-w-[56ch] text-lg">
          {content.contact.sub}
        </p>
      </PageHero>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="card p-6 h-full">
              <Phone size={26} weight="fill" className="text-forest-600" />
              <p className="font-bold mt-3">Phone</p>
              <p className="text-sm text-stone-500 mt-1">
                [number to be confirmed]
              </p>
              <a
                href={PHONE_HREF}
                className="mt-3 inline-block font-display font-bold text-xl text-forest-700 hover:text-forest-800"
              >
                {PHONE_LABEL}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="card p-6 h-full">
              <EnvelopeSimple size={26} weight="fill" className="text-forest-600" />
              <p className="font-bold mt-3">Email</p>
              <p className="text-sm text-stone-500 mt-1">
                Best for anything that isn't urgent.
              </p>
              <p data-edit="contact.email" className="mt-3 font-display font-bold text-xl text-forest-700">
                {content.contact.email}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="card p-6 h-full">
              <MapPin size={26} weight="fill" className="text-forest-600" />
              <p className="font-bold mt-3">Location</p>
              <p
                data-edit="contact.address"
                className="text-sm text-stone-600 mt-1 leading-relaxed whitespace-pre-line"
              >
                {content.contact.address}
              </p>
              <div className="mt-4 aspect-video card !border-stone-200 bg-stone-100 flex items-center justify-center text-center px-4">
                <p className="text-sm text-stone-400">
                  Map goes here once the address is public
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="card p-6 h-full">
              <Clock size={26} weight="fill" className="text-forest-600" />
              <p className="font-bold mt-3">Opening hours</p>
              <p className="text-sm text-stone-500 mt-1">
                [hours to be confirmed]
              </p>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {content.contact.hours.map((row, i) => (
                    <tr key={row.days + i} className="border-t border-stone-100 first:border-t-0">
                      <td data-edit={`contact.hours.${i}.days`} className="py-2 text-stone-600">
                        {row.days}
                      </td>
                      <td
                        data-edit={`contact.hours.${i}.hours`}
                        className="py-2 text-right font-semibold text-ink"
                      >
                        {row.hours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="mt-8 card p-6 bg-forest-50/60 !border-forest-100 sm:flex items-center justify-between gap-6">
            <p className="text-stone-700 font-medium">
              Car questions go faster by phone. It beats waiting on an email
              back and forth.
            </p>
            <Link href="/cars" className="btn-primary mt-4 sm:mt-0 shrink-0">
              Browse the cars
              <ArrowRight size={18} weight="bold" />
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
