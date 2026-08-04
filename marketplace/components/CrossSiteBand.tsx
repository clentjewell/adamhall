import { brand, parentSite, parentUrl } from "@/lib/brand";

/**
 * The crossing between the two domains.
 *
 * Identity section 08 is specific about this: the crossing is named, not a nav
 * item buried in a list. One band at the foot of each site, saying plainly what
 * is on the other side. Two domains means a visitor will cross between them,
 * and the crossing is where a sub-brand usually feels broken.
 *
 * This is also the one place both marks may appear together. Everywhere else on
 * the marketplace, Car Marketplace leads alone.
 */
export default function CrossSiteBand() {
  return (
    <aside
      className="bg-forest-600 text-white"
      aria-label={`Selling a car — go to ${parentSite.name}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
        <p className="flex-1 text-lg md:text-xl leading-snug">
          <span className="font-display font-extrabold">{parentSite.crossing.heading}</span>{" "}
          <span className="text-forest-100">{parentSite.crossing.body}</span>
        </p>

        <a
          href={parentUrl("/", "marketplace-footer-band")}
          className="btn shrink-0 bg-sand text-headline hover:bg-white px-6 py-3"
        >
          {parentSite.crossing.cta}
        </a>
      </div>

      <p className="max-w-6xl mx-auto px-4 pb-8 -mt-1 text-xs text-forest-200">
        {parentSite.name} and {brand.name} are the same business, the same phone
        number and the same service area. One buys your car, the other sells you
        one.
      </p>
    </aside>
  );
}
