import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/admin";

export const metadata = {
  title: "Site guide",
  robots: { index: false, follow: false },
};

// The full site walkthrough, served as a static page from /public and
// embedded here so Adam can flick through it without leaving the console.
export default async function GuidePage() {
  await requireAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl">Site guide</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Every page and tool, with a screenshot and simple steps. Use the arrow keys to move through it.
          </p>
        </div>
        <a
          href="/site-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm shrink-0"
        >
          Open full screen
          <ArrowSquareOut size={16} weight="bold" />
        </a>
      </div>

      <div className="card overflow-hidden !p-0">
        <iframe
          src="/site-guide"
          title="Buy My Car — site guide"
          className="w-full h-[calc(100dvh-11rem)] min-h-[520px] border-0 bg-ink"
        />
      </div>
    </div>
  );
}
