import type { Metadata } from "next";
import { SealWarning } from "@phosphor-icons/react/dist/ssr";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply to using the Adam Hall Buy My Car website.",
};

// Tiny local renderer: lines starting "## " become headings, other
// blank-line-separated blocks become paragraphs. Keeps legal copy editable
// as plain text without letting arbitrary markup into the page.
function renderLegalText(text: string) {
  return text.split(/\n\s*\n/).map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="font-display font-bold text-xl mt-8 mb-3">
          {trimmed.slice(3).trim()}
        </h2>
      );
    }
    return (
      <p key={i} className="text-stone-700 leading-relaxed mb-4">
        {trimmed}
      </p>
    );
  });
}

export default async function TermsPage() {
  const content = await getContent();

  return (
    <div className="max-w-[70ch] mx-auto px-4 py-16">
      <div className="card bg-amber-soft !border-amber-accent/40 p-5 mb-8 flex gap-3 items-start">
        <SealWarning size={22} weight="fill" className="text-[#8a5a1e] shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-ink">
          DRAFT — requires review by the dealership's legal adviser for
          NSW/QLD before launch.
        </p>
      </div>

      <h1 className="font-display font-extrabold text-3xl md:text-4xl">Terms of Use</h1>
      {renderLegalText(content.legal.terms)}
    </div>
  );
}
