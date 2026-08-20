/* ------------------------------------------------------------------
   Central site configuration & shared content.
   Edit values here to update contact details, nav, trust items, etc.
   ------------------------------------------------------------------ */

export const site = {
  name: 'Car Marketplace',
  domain: 'carmarketplace.com.au',
  phoneDisplay: '0404 290 617',
  phoneHref: 'tel:0404290617',
  tagline:
    'A short, hand-picked range of cars, curated not classified, across the Gold Coast, Brisbane and Northern Rivers',
  serviceAreas: 'Gold Coast, Brisbane & Northern Rivers',
  linkedin: 'https://www.linkedin.com/',
  copyright: `© ${new Date().getFullYear()} carmarketplace.com.au. All Rights Reserved.`,
};

/* ------------------------------------------------------------------
   Primary navigation — buy side only.
   ------------------------------------------------------------------ */
export const nav = [
  { label: 'The Marketplace', to: '/cars' },
  { label: 'Finance', to: '/finance' },
  { label: 'Compare', to: '/compare', garage: 'compare' as const },
  { label: 'Saved', to: '/saved', garage: 'saved' as const },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact-us' },
];

/* The buy side's own five. Same-day payment and the hassle-free guarantee are
   promises to a seller, so they are not here; these are facts about the stock
   and about who picked it. */
export const buyerTrustBar = [
  { icon: '/assets/icons/icon-shield.svg', label: 'Every car PPSR checked' },
  { icon: '/assets/icons/icon-hassle-free.svg', label: 'Faults named up front' },
  { icon: '/assets/icons/icon-27.svg', label: '27 years picking cars' },
  { icon: '/assets/icons/icon-stop-watch.svg', label: 'New arrivals regularly' },
  { icon: '/assets/icons/icon-5-star.svg', label: 'Five-star reviews' },
];

/* Three-item strip shown in the black pre-footer band. Buy-side claims only:
   facts about the stock, which is what this side of the business promises. */
export const preFooterTrust = [
  'Every car PPSR checked',
  'Faults named in the description',
  'Priced to sell',
];

/* Footer strapline for the buy side. */
export const marketplaceTagline =
  'A short, hand-picked range from an independent dealership with twenty-seven years in the trade. Gold Coast, Brisbane and Northern Rivers.';
