import type { Metadata } from "next";
import { SealWarning } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply to using the Adam Hall Buy My Car website.",
};

export default function TermsPage() {
  return (
    <div className="max-w-[70ch] mx-auto px-4 py-16">
      <div className="card bg-amber-soft !border-amber-accent/40 p-5 mb-8 flex gap-3 items-start">
        <SealWarning size={22} weight="fill" className="text-amber-accent shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-ink">
          DRAFT — requires review by the dealership's legal adviser for
          NSW/QLD before launch.
        </p>
      </div>

      <h1 className="font-display font-extrabold text-3xl md:text-4xl">Terms of Use</h1>
      <p className="mt-4 text-stone-700 leading-relaxed">
        These terms cover your use of this website. By browsing the site or
        submitting a form, you're agreeing to them.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Using this site</h2>
      <p className="text-stone-700 leading-relaxed">
        This website is provided so you can browse current stock, sell a
        car, and get in touch with Adam Hall Buy My Car. You agree to use it
        only for those purposes, and not to interfere with how it runs or
        misuse any form on it.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Listing accuracy</h2>
      <p className="text-stone-700 leading-relaxed">
        Every listing is written and checked in good faith, and we make
        every reasonable effort to describe each car accurately, including
        any known faults. Details such as specifications, odometer readings
        and availability can change without notice, and small errors can
        occur. Always confirm the details that matter to you in person
        before you buy.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Pricing</h2>
      <p className="text-stone-700 leading-relaxed">
        Prices shown are drive-away prices unless a listing states
        otherwise. Drive-away price includes registration, stamp duty and
        other on-road costs current at the time of sale, and is subject to
        change if those government charges change.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Availability</h2>
      <p className="text-stone-700 leading-relaxed">
        Cars sell quickly and stock moves fast. A car showing as available
        on this site may already be sold or under offer by the time you
        enquire. We'll always tell you straight away if that's the case.
      </p>
    </div>
  );
}
