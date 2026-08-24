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

// The home page's hero film: a short loop of the yard, playing in the
// background behind the opening words.
//
// This is the film the page used before the scroll treatment, and it is back
// because Adam asked for the scrubbing to go and a plain loop to take its
// place. It is the right file for that job rather than a convenient one:
// five seconds of near-still motion built to come back round on itself,
// 1600x900, and 352KB against the scroll film's 4.9MB. Weight matters far
// more now than it did then — a scrubbed film only ever downloaded for the
// readers who were going to scrub it, and this one starts on every visit.
//
// Its poster is cut from its own first frame, so the still and the loop start
// on the same pixel. HeroFilm cross-fades between them anyway, so nothing
// jumps even if the two ever drift apart.
//
// home-scroll.mp4 and its poster are left in /brand rather than deleted: they
// are the whole of the scroll treatment's picture, and reverting this needs
// them. Nothing references them now, so nothing downloads them.
export const homeHeroFilm = {
  src: "/brand/cars-hero.mp4",
  poster: "/brand/cars-hero.jpg",
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
