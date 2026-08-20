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
  sell: "/brand/sell-head.mp4",
} as const;

// The home page's scroll film: four generated clips joined by short dissolves
// into one continuous move — an approach to a row of cars, a track along it,
// a pass over the detail, and out onto the road. Encoded all-intra (every
// frame a keyframe) so a scroll seek never has to decode forward from a
// distant one, at 12fps because the frame rate the reader perceives comes
// from their own scroll speed rather than the file. Its poster is cut from
// its own first frame, so the handover lands on the identical pixel.
export const homeScrollFilm = {
  src: "/brand/home-scroll.mp4",
  poster: "/brand/home-scroll-poster.jpg",
} as const;

// The films behind the page header bands, one per page, generated to the same
// brief as the home film: near-still motion, Australian light, cars and no
// people. Each is its own scene so a visitor moving between pages is not shown
// the same loop twice. HeaderFilm plays them; they carry no poster because
// they are a background over a green ground that stands on its own.
export const headerFilms = {
  cars: "/brand/cars-head.mp4",
  sell: "/brand/sell-head.mp4",
  finance: "/brand/finance-head.mp4",
  faq: "/brand/faq-head.mp4",
  contact: "/brand/contact-head.mp4",
  valuation: "/brand/valuation-head.mp4",
} as const;

export const pageHeroImages = {
  home: "/brand/cars-hero.jpg",
  cars: "/brand/cars-hero.jpg",
  sell: heroImages.sell,
} as const;
