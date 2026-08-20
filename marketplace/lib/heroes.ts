// Page hero imagery.
//
// Two sources: the local /brand files (the one film that shows only cars,
// with its poster cut from the film's first frame), and generated brand
// photography in the public car-photos bucket under heroes/ — a dusk shot of
// the yard and a key handover, neither showing a person's face. The old
// per-page films are gone: they were the parent brand's footage of its
// owner, which this site no longer shows anywhere.
const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ocyxhfyphqyirjbyvhnw.supabase.co"}/storage/v1/object/public/car-photos/heroes`;

export const heroImages = {
  home: `${base}/home.jpg`,
  cars: `${base}/cars.jpg`,
  sell: `${base}/sell.jpg`,
};

// The film pairs with a poster cut from its own first frame, so the still and
// the loop start on the exact same pixel and there is no jump when playback
// begins. HeroVideo keeps the poster permanently for reduced-motion and
// save-data users, and whenever autoplay is refused.
export const pageHeroVideos = {
  home: "/brand/cars-hero.mp4",
  cars: "/brand/cars-hero.mp4",
} as const;

export const pageHeroImages = {
  home: "/brand/cars-hero.jpg",
  cars: "/brand/cars-hero.jpg",
  sell: heroImages.sell,
} as const;
