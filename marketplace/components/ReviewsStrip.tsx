import { Star } from "@phosphor-icons/react/dist/ssr";
import { googleReviews } from "@/lib/config";

export default function ReviewsStrip() {
  return (
    <section aria-label="Customer reviews" className="bg-forest-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-0.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} weight="fill" className="text-amber-accent" />
            ))}
          </div>
          <p className="font-semibold">
            {googleReviews.rating} from {googleReviews.count} Google reviews
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {googleReviews.quotes.map((q) => (
            <figure key={q.author}>
              <blockquote className="text-forest-50 leading-relaxed">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-forest-200">
                {q.author}, {q.suburb}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
