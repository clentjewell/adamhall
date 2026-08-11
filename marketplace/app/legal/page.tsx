import type { Metadata } from "next";
import Link from "next/link";
import { SealWarning, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Legal",
  description:
    "Privacy, terms of use, website and finance disclaimers, and how to make a complaint.",
};

// Index for /legal/*. The five documents below already existed as routes but
// nothing linked to them and the bare /legal path 404'd, so they were live and
// unreachable. Keep this list in step with the folders in app/legal.
const documents = [
  {
    href: "/legal/privacy",
    title: "Privacy Policy",
    blurb:
      "What we collect when you enquire, save a car or join the watchlist, and what we do with it.",
  },
  {
    href: "/legal/terms",
    title: "Terms of Use",
    blurb: "The terms that apply to using this website.",
  },
  {
    href: "/legal/website-disclaimer",
    title: "Website Disclaimer",
    blurb:
      "How accurate the listing information is, and what to check before you commit to a car.",
  },
  {
    href: "/legal/finance-disclaimer",
    title: "Finance Disclaimer",
    blurb:
      "What the repayment figures and calculators on this site represent, and what they do not.",
  },
  {
    href: "/legal/complaints",
    title: "Complaints",
    blurb:
      "How to raise something with us, and where to take it if we cannot sort it out.",
  },
];

export default function LegalIndexPage() {
  return (
    <div className="max-w-[70ch] mx-auto px-4 py-16">
      <div className="card bg-amber-soft !border-amber-accent/40 p-5 mb-8 flex gap-3 items-start">
        <SealWarning size={22} weight="fill" className="text-[#8a5a1e] shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-ink">
          DRAFT: every document below requires review by the dealership&apos;s
          legal adviser for NSW/QLD before launch.
        </p>
      </div>

      <h1 className="font-display font-extrabold text-3xl md:text-4xl">Legal</h1>
      <p className="text-stone-700 leading-relaxed mt-4 mb-10">
        The policies and disclaimers that apply to this website and to buying a
        car from us. If something here is unclear, ring us and ask.
      </p>

      <ul className="grid gap-3">
        {documents.map((doc) => (
          <li key={doc.href}>
            <Link
              href={doc.href}
              className="card p-5 flex items-start justify-between gap-4 hover:border-forest-500 transition-colors group"
            >
              <span>
                <span className="block font-display font-bold text-lg text-ink">
                  {doc.title}
                </span>
                <span className="block text-sm text-stone-600 leading-relaxed mt-1">
                  {doc.blurb}
                </span>
              </span>
              <ArrowRight
                size={20}
                weight="bold"
                className="text-forest-600 shrink-0 mt-1 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
