// Page hero imagery — generated brand photography hosted in the public
// car-photos bucket under heroes/. Swap paths here to re-art-direct.
const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ocyxhfyphqyirjbyvhnw.supabase.co"}/storage/v1/object/public/car-photos/heroes`;

export const heroImages = {
  home: `${base}/home.jpg`,
  cars: `${base}/cars.jpg`,
  sell: `${base}/sell.jpg`,
};

// Looping blueprint animation behind the home hero; heroImages.home is its
// poster and reduced-motion/save-data fallback.
export const heroVideo = `${base}/hero-loop.mp4`;

// Looping film behind the About Adam hero, served as a static asset. The
// forecourt still (heroImages.home) is its poster and reduced-motion /
// save-data fallback.
export const aboutHeroVideo = "/brand/about-hero.mp4";
