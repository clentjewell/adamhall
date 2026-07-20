import type { Metadata } from "next";
import { SealWarning } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Website Disclaimer",
  description: "Notes on imagery, accuracy and how to report an error on this site.",
};

export default function WebsiteDisclaimerPage() {
  return (
    <div className="max-w-[70ch] mx-auto px-4 py-16">
      <div className="card bg-amber-soft !border-amber-accent/40 p-5 mb-8 flex gap-3 items-start">
        <SealWarning size={22} weight="fill" className="text-amber-accent shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-ink">
          DRAFT — requires review by the dealership's legal adviser for
          NSW/QLD before launch.
        </p>
      </div>

      <h1 className="font-display font-extrabold text-3xl md:text-4xl">Website Disclaimer</h1>
      <p className="mt-4 text-stone-700 leading-relaxed">
        This page covers a few things worth knowing about the content on
        this site, beyond the individual car listings themselves.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Imagery</h2>
      <p className="text-stone-700 leading-relaxed">
        Photos on individual car listings are of the actual vehicle for
        sale. Some other imagery on this site, such as background and
        lifestyle photography used for design purposes, is AI-generated
        placeholder content pending real photography of the yard and stock.
        This will be replaced with genuine photos as they're taken.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Errors and omissions</h2>
      <p className="text-stone-700 leading-relaxed">
        We take reasonable care to keep this site accurate and current, but
        errors, outdated details and omissions can happen. If something
        looks wrong, tell us and we'll fix it. Nothing on this site should
        be relied on as the final word on a car's condition or a page's
        content without confirming it with us directly.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Limitation</h2>
      <p className="text-stone-700 leading-relaxed">
        To the extent permitted by law, Adam Hall Buy My Car isn't liable
        for loss arising from reliance on information on this site that
        turns out to be incomplete or incorrect. This doesn't affect any
        rights you have under the Australian Consumer Law that can't be
        excluded.
      </p>
    </div>
  );
}
