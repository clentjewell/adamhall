// ---------------------------------------------------------------------------
// Car Marketplace brand configuration — the one swappable spot.
//
// Car Marketplace runs as its own site: no parent, no crossing, no seller
// pages belonging to anyone else. It keeps the endorsement in its mark, which
// is a signature on the cars rather than a second business to visit. Colours
// and type live in app/globals.css @theme; everything name- and mark-related
// lives here. No component should hard-code a brand string or a logo path.
//
// The logo is the primary horizontal lockup Liz supplied (Car Marketplace
// brand pack, "01 Car_Marketplace_Primary_Logo"): the cart, the wordmark and
// the endorsement set as one piece of artwork. It is used as supplied, because
// the signature in it is drawn rather than typeset and cannot be rebuilt from
// live text. `src` is the black cut for light grounds, `srcReverse` the white
// for green and photography; the mark is black or white and never recoloured
// (identity section 03). Only BrandLockup reads this.
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
  /** Written in full on first mention, then just `name`. Never "CM", never
      "Adam Hall Car Marketplace" — the order carries the hierarchy. */
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
