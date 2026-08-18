import { brand, parentSite, parentUrl } from "@/lib/brand";
import Button from "@/components/site/Button";

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
 *
 * Sits directly beneath the green trust strip with no background of its own, so
 * the two read as a single block. Centred to match the strip above, and using
 * the site's own tan button so the sand carries dark ink rather than white.
 */
export default function CrossSiteBand() {
  return (
    <aside
      className="prefooter-crossing"
      aria-label={`Selling a car, go to ${parentSite.name}`}
    >
      <div className="container container--wide">
        <p className="prefooter-crossing__line">
          <strong>{parentSite.crossing.heading}</strong> {parentSite.crossing.body}
        </p>

        <Button href={parentUrl("/", "marketplace-footer-band")} variant="tan" arrow newTab>
          {parentSite.crossing.cta}
        </Button>

        <p className="prefooter-crossing__note">
          {parentSite.name} and {brand.name} are the same business, the same
          phone number and the same service area. One buys your car, the other
          sells you one.
        </p>
      </div>
    </aside>
  );
}
