// ---------------------------------------------------------------------------
// Car Marketplace brand configuration — the one swappable spot.
//
// Source: "Car Marketplace by Adam Hall — Brand Identity", Edition 1,
// August 2026 (Liz / Jewell Projects). Colours and type live in
// app/globals.css @theme; everything name-, mark- and crossing-related lives
// here. No component should hard-code a brand string or a logo path.
//
// The logo is the primary horizontal lockup Liz supplied (Car Marketplace
// brand pack, "01 Car_Marketplace_Primary_Logo"), approved for use by the
// client: the cart, the wordmark and Adam's own signature set as one piece of
// artwork. It is used as supplied — the signature is drawn, not typeset, so it
// cannot be rebuilt from live text. `src` is the black cut for light grounds,
// `srcReverse` the white for green and photography; the mark is black or white
// and never recoloured (identity section 03). Only BrandLockup reads this.
// ---------------------------------------------------------------------------

export type BrandLogo =
  | { kind: "wordmark" }
  | { kind: "image"; src: string; srcReverse: string; width: number; height: number }
  /**
   * The cart mark set beside the wordmark, which is the identity's primary
   * horizontal lockup. `cart` is the black artwork for light grounds, `cartReverse`
   * the white for green and photography. The mark is black or white, never
   * recoloured (identity section 03). The wordmark and endorsement beside it are
   * set live in the brand face, so the two brands share one type.
   */
  | { kind: "mark"; cart: string; cartReverse: string };

export const brand = {
  /** Written in full on first mention, then just `name`. Never "CM", never "Adam Hall Car Marketplace" — the order carries the hierarchy. */
  name: "Car Marketplace",
  endorsement: "by Adam Hall",
  fullName: "Car Marketplace by Adam Hall",

  domain: "carmarketplace.com.au",

  logo: {
    kind: "image",
    src: "/brand/car-marketplace-logo.svg",
    srcReverse: "/brand/car-marketplace-logo-white.svg",
    width: 1103,
    height: 377,
  } as BrandLogo,

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
