import type { Metadata } from "next";
import { SealWarning } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Finance Disclaimer",
  description: "What the finance figures on this website do, and don't, mean.",
};

export default function FinanceDisclaimerPage() {
  return (
    <div className="max-w-[70ch] mx-auto px-4 py-16">
      <div className="card bg-amber-soft !border-amber-accent/40 p-5 mb-8 flex gap-3 items-start">
        <SealWarning size={22} weight="fill" className="text-amber-accent shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-ink">
          DRAFT — requires review by the dealership's legal adviser for
          NSW/QLD before launch.
        </p>
      </div>

      <h1 className="font-display font-extrabold text-3xl md:text-4xl">Finance Disclaimer</h1>
      <p className="mt-4 text-stone-700 leading-relaxed">
        This page explains what any finance figures, repayment estimates or
        calculators on this site actually represent.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Estimates only</h2>
      <p className="text-stone-700 leading-relaxed">
        Any repayment figures shown on this site are estimates for general
        guidance only. They are not a quote, not an offer of finance, and
        not a pre-approval.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Not an offer or approval</h2>
      <p className="text-stone-700 leading-relaxed">
        Nothing on this site constitutes a finance offer or a guarantee of
        approval. Any actual loan is arranged between you and a lender, and
        is subject to that lender's own assessment.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Lender criteria apply</h2>
      <p className="text-stone-700 leading-relaxed">
        Approval, interest rate and loan term all depend on the lender's
        own credit criteria, your financial circumstances, and the
        information you provide when you apply. The figures on this site
        may not reflect what you're ultimately offered.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Comparison rate</h2>
      <p className="text-stone-700 leading-relaxed">
        [comparison rate placeholder, e.g. "Comparison rate X.XX% based on a
        $XX,XXX loan over 5 years. WARNING: This comparison rate is true
        only for the example given and may not include all fees and
        charges."] Comparison rate wording must be confirmed against actual
        lender terms before publication.
      </p>
    </div>
  );
}
