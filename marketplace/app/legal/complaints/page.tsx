import type { Metadata } from "next";
import { SealWarning } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Complaints",
  description: "How to raise a concern with Adam Hall Buy My Car, and what to do if it isn't resolved.",
};

export default function ComplaintsPage() {
  return (
    <div className="max-w-[70ch] mx-auto px-4 py-16">
      <div className="card bg-amber-soft !border-amber-accent/40 p-5 mb-8 flex gap-3 items-start">
        <SealWarning size={22} weight="fill" className="text-amber-accent shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-ink">
          DRAFT — requires review by the dealership's legal adviser for
          NSW/QLD before launch.
        </p>
      </div>

      <h1 className="font-display font-extrabold text-3xl md:text-4xl">Complaints</h1>
      <p className="mt-4 text-stone-700 leading-relaxed">
        Most problems get sorted with a phone call. Here's how to raise one,
        and what your options are if it doesn't get resolved.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Talk to Adam first</h2>
      <p className="text-stone-700 leading-relaxed">
        This is a one-person dealership, so any concern goes straight to
        the person who can actually fix it. Call or email through the{" "}
        <a href="/contact" className="text-forest-700 font-semibold underline">
          Contact page
        </a>{" "}
        and explain what's happened. Most issues are resolved this way,
        quickly and without fuss.
      </p>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">If it isn't resolved</h2>
      <p className="text-stone-700 leading-relaxed">
        If you've spoken with Adam and the matter still isn't sorted to
        your satisfaction, you can raise it with the relevant consumer
        affairs body in your state.
      </p>
      <ul className="mt-3 space-y-2 text-stone-700 leading-relaxed list-disc pl-5">
        <li>NSW Fair Trading: [phone / website placeholder]</li>
        <li>Queensland Office of Fair Trading: [phone / website placeholder]</li>
      </ul>

      <h2 className="font-display font-bold text-xl mt-10 mb-3">Motor dealer licence</h2>
      <p className="text-stone-700 leading-relaxed">
        Adam Hall Buy My Car operates under motor dealer licence number
        [licence number pending]. This licence is what allows a complaint
        to be escalated to the relevant fair trading authority if it can't
        be resolved directly with us.
      </p>
    </div>
  );
}
