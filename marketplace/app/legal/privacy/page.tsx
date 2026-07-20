import type { Metadata } from "next";
import { SealWarning } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Adam Hall Buy My Car collects, stores and uses your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[70ch] mx-auto px-4 py-16">
      <div className="card bg-amber-soft !border-amber-accent/40 p-5 mb-8 flex gap-3 items-start">
        <SealWarning size={22} weight="fill" className="text-amber-accent shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-ink">
          DRAFT — requires review by the dealership's legal adviser for
          NSW/QLD before launch.
        </p>
      </div>

      <h1 className="font-display font-extrabold text-3xl md:text-4xl">Privacy Policy</h1>
      <p className="mt-4 text-stone-700 leading-relaxed">
        Adam Hall Buy My Car respects your privacy. This policy explains what
        information we collect through this website, why we collect it, and
        what you can do if you want it changed or removed.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">What we collect</h2>
      <p className="text-stone-700 leading-relaxed">
        We collect the information you give us directly, through the forms
        on this site:
      </p>
      <ul className="mt-3 space-y-2 text-stone-700 leading-relaxed list-disc pl-5">
        <li>
          <strong>Enquiry and book-a-look forms:</strong> your name, phone
          number, email and any message about a specific car.
        </li>
        <li>
          <strong>Sell your car forms:</strong> your rego, vehicle details,
          photos, odometer reading and contact details, so we can make an
          offer.
        </li>
        <li>
          <strong>Finance enquiries:</strong> basic details needed to
          provide a rough repayment estimate. We do not collect full credit
          applications through this site.
        </li>
      </ul>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Why we collect it</h2>
      <p className="text-stone-700 leading-relaxed">
        We use this information to respond to your enquiry, make an offer on
        a car you're selling, arrange a viewing or test drive, and to keep
        you updated on stock if you've asked to be. We don't use it for
        anything beyond running the dealership.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Where it's stored</h2>
      <p className="text-stone-700 leading-relaxed">
        Website form data is stored using Supabase, hosted in an Australian
        (AU) data region. Access is limited to Adam and the systems that
        run this site.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">We don't sell your data</h2>
      <p className="text-stone-700 leading-relaxed">
        We don't sell, rent or trade your personal information to anyone.
        It's used to run this dealership and nothing else.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Access and deletion</h2>
      <p className="text-stone-700 leading-relaxed">
        You can ask what information we hold about you, ask us to correct
        it, or ask us to delete it. Get in touch through the{" "}
        <a href="/contact" className="text-forest-700 font-semibold underline">
          Contact page
        </a>{" "}
        and we'll sort it out.
      </p>
    </div>
  );
}
