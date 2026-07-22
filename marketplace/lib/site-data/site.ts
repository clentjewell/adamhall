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

export const nav = [
  { label: 'How it Works', to: '/how-it-works' },
  { label: 'Buy My Car', to: '/buy-my-car' },
  { label: "Adam's Story", to: '/about-adam-hall' },
  { label: 'Listen', to: '/listen-whats-your-car-worth' },
  { label: 'Contact', to: '/contact-us' },
];

/* Five-item trust bar shown on green hero sections */
export const trustBar = [
  { icon: '/assets/icons/icon-5-star.svg', label: '5 Star Reviews' },
  { icon: '/assets/icons/icon-hassle-free.svg', label: 'Hassle-free Guarantee' },
  { icon: '/assets/icons/icon-shield.svg', label: 'Real Market Pricing' },
  { icon: '/assets/icons/icon-27.svg', label: 'Over 27 Years Experience' },
  { icon: '/assets/icons/icon-stop-watch.svg', label: 'Same Day Payment' },
];

/* Three-item strip shown in the black pre-footer band */
export const preFooterTrust = [
  '1K+ Happy Customers',
  'Up-to-the-minute Market Pricing',
  'Hassle-free Guarantee',
];
