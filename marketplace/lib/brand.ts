// ---------------------------------------------------------------------------
// Car Marketplace brand configuration — the one swappable spot.
//
// Source: "Car Marketplace by Adam Hall — Brand Identity", Edition 1,
// August 2026 (Liz / Jewell Projects). Colours and type live in
// app/globals.css @theme; everything name-, mark- and crossing-related lives
// here. No component should hard-code a brand string or a logo path.
//
// The supplied cart mark is a PLACEHOLDER: raster only, no vector master, and
// section 03 of the identity states it must not be issued to a developer until
// the artwork is signed off. So `logo.kind` is "wordmark" and the header
// renders type, not artwork. When the vector master lands, drop the file in
// public/brand/ and switch `logo` to the image variant below. That is the only
// change required — BrandLockup reads this and nothing else does.
// ---------------------------------------------------------------------------

export type BrandLogo =
  | { kind: "wordmark" }
  | { kind: "image"; src: string; srcReverse: string; width: number; height: number };

export const brand = {
  /** Written in full on first mention, then just `name`. Never "CM", never "Adam Hall Car Marketplace" — the order carries the hierarchy. */
  name: "Car Marketplace",
  endorsement: "by Adam Hall",
  fullName: "Car Marketplace by Adam Hall",

  domain: "carmarketplace.com.au",

  /** Swap to { kind: "image", ... } once a signed-off vector master exists. */
  logo: { kind: "wordmark" } as BrandLogo,

  /** "Curated, not classified." — the two words that separate this from every other place a used car is sold online. */
  essence: "Curated, not classified.",
} as const;

// ---------------------------------------------------------------------------
// The parent brand, and the crossing between the two sites.
//
// Identity section 08: the crossing is *named*, not a nav item buried in a
// list. One band at the foot of each site saying plainly what is on the other
// side. The wording below is quoted from the identity document.
// ---------------------------------------------------------------------------

export const parentSite = {
  name: "Adam Hall Buy My Car",
  shortName: "Adam Hall",
  url: "https://adamhallbuymycar.com.au",

  /** Footer band on the marketplace, pointing sellers back to Adam. */
  crossing: {
    heading: "Selling instead?",
    body: "Adam will come to you and value it.",
    cta: "See how selling works",
  },

  /** Compact version for the header, worded as a service to the seller rather than a cross-sell. */
  headerLink: "Want to sell your car?",
} as const;

/**
 * Outbound links to the parent site carry a source tag so the handover between
 * the two domains is measurable. Without it there is no way to tell whether
 * the crossing works.
 */
export function parentUrl(path = "/", source = "marketplace-footer"): string {
  const url = new URL(path, parentSite.url);
  url.searchParams.set("utm_source", brand.domain);
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", source);
  return url.toString();
}
