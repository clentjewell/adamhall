import Stars from "./Stars";
import type { Testimonial } from "@/lib/site-data/testimonials";

/* --- Home "Happy Customers" grid (dark green) --- */
export function TestimonialGrid({
  title = "Happy Customers",
  items,
}: {
  title?: string;
  items: Testimonial[];
}) {
  return (
    <section className="tgrid section bg-green" aria-labelledby="tgrid-title">
      <div className="container container--wide">
        <h2 id="tgrid-title" className="tgrid__title reveal">
          {title}
        </h2>
        <ul className="tgrid__list">
          {items.map((t, i) => (
            <li key={i} className="tgrid__item reveal">
              <span
                className="tgrid__rating"
                role="img"
                aria-label="5 out of 5 stars"
              >
                5<Stars count={1} className="stars--purple" />
              </span>
              <p>{t.quote}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --- Named testimonial list (with attribution) --- */
export function TestimonialList({ items }: { items: Testimonial[] }) {
  return (
    <ul className="tlist">
      {items.map((t, i) => (
        <li key={i} className="tlist__item reveal">
          <div className="tlist__meta">
            <span className="tlist__name">
              {t.name}
              {t.location ? `, ${t.location}` : ""}
            </span>
            <Stars className="stars--purple" />
          </div>
          <p>{t.quote}</p>
        </li>
      ))}
    </ul>
  );
}

/* --- Single featured quote (used inside green hero panels) --- */
export function FeaturedQuote({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role?: string;
}) {
  return (
    <figure className="fquote">
      <Stars className="stars--purple" />
      <blockquote>{quote}</blockquote>
      <figcaption>
        <strong>{name}</strong>
        {role ? <span>{role}</span> : null}
      </figcaption>
    </figure>
  );
}
