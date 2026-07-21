// Page hero imagery — generated brand photography hosted in the public
// car-photos bucket under heroes/. Swap paths here to re-art-direct.
const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ocyxhfyphqyirjbyvhnw.supabase.co"}/storage/v1/object/public/car-photos/heroes`;

export const heroImages = {
  home: `${base}/home.jpg`,
  cars: `${base}/cars.jpg`,
  sell: `${base}/sell.jpg`,
};

// Looping film behind the home hero — Adam closing a straight deal in the
// driveway, animated from his own brand photography and served as a static
// asset. homeHeroImage is its poster and reduced-motion / save-data fallback.
export const heroVideo = "/brand/home-hero.mp4";
export const homeHeroImage = "/brand/home-hero.jpg";

// Looping film behind the About Adam hero, served as a static asset. The
// forecourt still (heroImages.home) is its poster and reduced-motion /
// save-data fallback.
export const aboutHeroVideo = "/brand/about-hero.mp4";

// Per-page hero films — Adam's own brand shots animated with minimal,
// near-still motion (Higgsfield). Each page pairs the video with its own
// still poster (the exact start frame) for reduced-motion / save-data.
export const pageHeroVideos = {
  cars: "/brand/cars-hero.mp4",
  sell: "/brand/sell-hero.mp4",
  finance: "/brand/finance-hero.mp4",
  contact: "/brand/contact-hero.mp4",
  faq: "/brand/faq-hero.mp4",
} as const;

export const pageHeroImages = {
  cars: "/brand/cars-hero.jpg",
  sell: "/brand/sell-hero.jpg",
  finance: "/brand/finance-hero.jpg",
  contact: "/brand/contact-hero.jpg",
  faq: "/brand/faq-hero.jpg",
} as const;
