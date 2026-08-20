// ---------------------------------------------------------------------------
// Car Marketplace brand configuration — the one swappable spot.
//
// Car Marketplace is a standalone brand: no parent site, no endorsement, no
// crossing. Colours and type live in app/globals.css @theme; everything
// name- and mark-related lives here. No component should hard-code a brand
// string or a logo path.
//
// The logo is the cart mark beside the wordmark. Only BrandLockup reads this.
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
  /** Written in full on first mention, then just `name`. Never "CM". */
  name: "Car Marketplace",
  endorsement: "",
  fullName: "Car Marketplace",

  domain: "carmarketplace.com.au",

  logo: {
    kind: "mark",
    cart: "/brand/car-marketplace-cart.svg",
    cartReverse: "/brand/car-marketplace-cart-white.svg",
  } as BrandLogo,

  /** "Curated, not classified." — the two words that separate this from every other place a used car is sold online. */
  essence: "Curated, not classified.",
} as const;
