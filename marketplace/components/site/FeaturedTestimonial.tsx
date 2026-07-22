import { FeaturedQuote } from "./Testimonials";

interface Props {
  photo: string;
  photoAlt: string;
  quote: string;
  name: string;
  role?: string;
}

/** Green featured-testimonial band: photo with the empty photo-frame.svg
    overlapping it, curly arrow, and a large quote with tan attribution. */
export default function FeaturedTestimonial({
  photo,
  photoAlt,
  quote,
  name,
  role,
}: Props) {
  return (
    <section className="bg-green ftest">
      <div className="container container--wide ftest__inner">
        <div className="ftest__media reveal-zoom">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="ftest__photo"
            src={photo}
            alt={photoAlt}
            loading="lazy"
            width={486}
            height={608}
          />
          <span className="ftest__frame" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="ftest__arrow"
            src="/assets/decor/curly-arrow.svg"
            alt=""
            aria-hidden="true"
          />
        </div>
        <div className="ftest__quote reveal-right">
          <FeaturedQuote quote={quote} name={name} role={role} />
        </div>
      </div>
    </section>
  );
}
