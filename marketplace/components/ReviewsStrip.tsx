import { Star } from "@phosphor-icons/react/dist/ssr";
import { getContent } from "@/lib/content";

// Reviews flow right-to-left in a continuous strip. The quote set is
// repeated so the -50% translate loops seamlessly at any viewport width;
// hover pauses it and reduced-motion users get a static row.
export default async function ReviewsStrip() {
  const { reviews } = await getContent();
  const quotes = [...reviews.quotes, ...reviews.quotes];

  const cards = quotes.map((q, i) => (
    <figure
      key={i}
      className="w-[340px] md:w-[400px] shrink-0 rounded-2xl bg-forest-700/60 border border-forest-500/30 p-6"
    >
      <blockquote className="text-forest-50 leading-relaxed">
        &ldquo;{q.text}&rdquo;
      </blockquote>
      <figcaption className="mt-3 text-sm font-semibold text-forest-200">
        {q.author}, {q.suburb}
      </figcaption>
    </figure>
  ));

  return (
    <section aria-label="Customer reviews" className="bg-forest-800 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-12">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-0.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} weight="fill" className="text-amber-accent" />
            ))}
          </div>
          <p className="font-semibold">
            {reviews.rating} from {reviews.count} Google reviews
          </p>
          <span className="text-xs text-forest-200/80 basis-full sm:basis-auto">
            Sample reviews shown while the live Google feed is connected
          </span>
        </div>
      </div>

      <div className="marquee py-10">
        <div
          className="marquee-track flex items-stretch gap-5 w-max px-4"
          style={{ animationDuration: "45s" }}
        >
          {cards}
          {cards}
        </div>
      </div>
    </section>
  );
}
