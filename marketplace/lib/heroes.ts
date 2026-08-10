// Page hero imagery — generated brand photography hosted in the public
// car-photos bucket under heroes/. Swap paths here to re-art-direct.
const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ocyxhfyphqyirjbyvhnw.supabase.co"}/storage/v1/object/public/car-photos/heroes`;

export const heroImages = {
  home: `${base}/home.jpg`,
  cars: `${base}/cars.jpg`,
  sell: `${base}/sell.jpg`,
};

// Every public page opens on a looping film rather than a still. Each one is
// Adam's own brand photography animated with near-still motion (Higgsfield):
// a slow push-in, a breath of wind in the background, nothing that asks to be
// watched. Hero motion should go unnoticed — see the design-motion-principles
// skill; anything more energetic competes with the headline sitting over it.
//
// Each film pairs with a poster cut from its own first frame, so the still and
// the loop start on the exact same pixel and there is no jump when playback
// begins. HeroVideo keeps the poster permanently for reduced-motion and
// save-data users, and whenever autoplay is refused.
export const pageHeroVideos = {
  home: "/brand/home-hero.mp4",
  cars: "/brand/cars-hero.mp4",
  sell: "/brand/sell-hero.mp4",
  finance: "/brand/finance-hero.mp4",
  contact: "/brand/contact-hero.mp4",
  faq: "/brand/faq-hero.mp4",
  about: "/brand/about-hero.mp4",
  howItWorks: "/brand/how-it-works-hero.mp4",
  buyMyCar: "/brand/buy-my-car-hero.mp4",
} as const;

export const pageHeroImages = {
  home: "/brand/home-hero.jpg",
  cars: "/brand/cars-hero.jpg",
  sell: "/brand/sell-hero.jpg",
  finance: "/brand/finance-hero.jpg",
  contact: "/brand/contact-hero.jpg",
  faq: "/brand/faq-hero.jpg",
  about: "/brand/about-hero.jpg",
  howItWorks: "/brand/how-it-works-hero.jpg",
  buyMyCar: "/brand/buy-my-car-hero.jpg",
} as const;
