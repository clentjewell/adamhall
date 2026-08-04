/* ------------------------------------------------------------------
   Central site configuration & shared content.
   Edit values here to update contact details, nav, trust items, etc.
   ------------------------------------------------------------------ */

export const site = {
  name: 'Adam Hall Buy My Car',
  domain: 'adamhallbuymycar.com.au',
  phoneDisplay: '0404 290 617',
  phoneHref: 'tel:0404290617',
  tagline:
    'The easiest, fastest and safest way to sell your car in the Gold Coast, Brisbane and Northern Rivers',
  serviceAreas: 'Gold Coast, Brisbane & Northern Rivers',
  linkedin: 'https://www.linkedin.com/',
  copyright: `© ${new Date().getFullYear()} adamhallbuymycar.com.au. All Rights Reserved.`,
};

/* ------------------------------------------------------------------
   Primary navigation — buy side only.

   Identity section 08, on what must not happen: "the current shared
   navigation carried onto both. Mixing 'Adam's Story' in with 'Cars
   for Sale' and 'Finance' asks the visitor to hold two mindsets at
   once." So the parent's five seller pages are out of the nav. They
   still exist and still resolve; they are unlinked and noindexed
   until their copy is revisited.

   The crossing back to Adam is deliberately NOT in this list. It is
   named separately in the header and in CrossSiteBand.
   ------------------------------------------------------------------ */
export const nav = [
  { label: 'Cars for Sale', to: '/cars' },
  { label: 'Finance', to: '/finance' },
  { label: 'Compare', to: '/compare', garage: 'compare' as const },
  { label: 'Saved', to: '/saved', garage: 'saved' as const },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact-us' },
];

/* The parent's seller pages, kept reachable but off the nav and out of
   the index. Referenced by the pages themselves for their robots tag. */
export const unlistedSellerPages = [
  '/how-it-works',
  '/buy-my-car',
  '/listen-whats-your-car-worth',
  '/privacy-policy',
];

/* Five-item trust bar shown on green hero sections */
export const trustBar = [
  { icon: '/assets/icons/icon-5-star.svg', label: '5 Star Reviews' },
  { icon: '/assets/icons/icon-hassle-free.svg', label: 'Hassle-free Guarantee' },
  { icon: '/assets/icons/icon-shield.svg', label: 'Real Market Pricing' },
  { icon: '/assets/icons/icon-27.svg', label: 'Over 27 Years Experience' },
  { icon: '/assets/icons/icon-stop-watch.svg', label: 'Same Day Payment' },
];

/* Three-item strip shown in the black pre-footer band.

   Buy-side claims only. Identity section 08 lists what Car Marketplace must
   never claim as its own, and the hassle-free selling guarantee is on it: the
   marketplace may display the parent's badge, it may not reword it. The three
   below are facts about the stock, which is what this side of the business
   actually promises. */
export const preFooterTrust = [
  'Every car PPSR checked',
  'Faults named in the description',
  'Around 25 cars a month',
];

/* Footer strapline for the buy side. The seller tagline above stays put for the
   parent pages that are still hosted here. */
export const marketplaceTagline =
  'A short, hand-picked range from an independent dealer with twenty-seven years behind him. Gold Coast, Brisbane and Northern Rivers.';
