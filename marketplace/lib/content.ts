import "server-only";
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { googleReviews } from "@/lib/config";

// Every word here is editable from /admin/content. The saved object is
// merged over these defaults, so a blank field falls back to house copy.

export interface ReviewQuote {
  text: string;
  author: string;
  suburb: string;
}

export interface SiteContent {
  phone: { display: string; tel: string };
  hero: {
    headline: string;
    subtext: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  why: { title: string; body: string }[];
  sellBand: { heading: string; body: string; cta: string };
  carsHero: { title: string; sub: string };
  sellHero: { title: string; sub: string };
  footer: { blurb: string; deal: string[] };
  reviews: { rating: number; count: number; quotes: ReviewQuote[] };
}

export const CONTENT_DEFAULTS: SiteContent = {
  phone: { display: "0400 000 000", tel: "tel:+61400000000" },
  hero: {
    headline: "Good cars. Straight answers. Money that moves fast.",
    subtext:
      "Every car here is one Adam picked, checked and priced himself. What we say about it is what you get.",
    ctaPrimary: "Browse the cars",
    ctaSecondary: "Sell your car",
  },
  why: [
    {
      title: "Checked before listed",
      body: "PPSR, service books and an honest once-over on every single car.",
    },
    {
      title: "The price is the price",
      body: "No add-on games at the desk. The number on the car is the deal.",
    },
    {
      title: "Settlements that settle",
      body: "Paperwork done properly and funds moved the same day it clears.",
    },
  ],
  sellBand: {
    heading: "Selling? Adam will look at it today.",
    body: "Five minutes on your phone: rego, a few photos, done. Adam personally reviews every car and comes back with a real number within one business day.",
    cta: "Start with your rego",
  },
  carsHero: {
    title: "Cars for sale",
    sub: "Around 25 cars pass through here every month, so the good ones don't hang about. Sold cars stay up for a month so you can see what moves.",
  },
  sellHero: {
    title: "Sell your car without the circus",
    sub: "About five minutes on your phone. No listing fees, no tyre-kickers, no strangers at your house.",
  },
  footer: {
    blurb:
      "Quality used cars, honestly described and fairly priced. Northern NSW and the Tweed–Gold Coast border.",
    deal: [
      "Every car PPSR checked before listing",
      "Condition described straight, faults included",
      "Offers made within 1 business day",
      "Settlement the same day the paperwork clears",
    ],
  },
  reviews: {
    rating: googleReviews.rating,
    count: googleReviews.count,
    quotes: googleReviews.quotes,
  },
};

function merge(saved: Partial<SiteContent> | null): SiteContent {
  if (!saved) return CONTENT_DEFAULTS;
  return {
    phone: { ...CONTENT_DEFAULTS.phone, ...saved.phone },
    hero: { ...CONTENT_DEFAULTS.hero, ...saved.hero },
    why: saved.why?.length ? saved.why : CONTENT_DEFAULTS.why,
    sellBand: { ...CONTENT_DEFAULTS.sellBand, ...saved.sellBand },
    carsHero: { ...CONTENT_DEFAULTS.carsHero, ...saved.carsHero },
    sellHero: { ...CONTENT_DEFAULTS.sellHero, ...saved.sellHero },
    footer: {
      blurb: saved.footer?.blurb ?? CONTENT_DEFAULTS.footer.blurb,
      deal: saved.footer?.deal?.length ? saved.footer.deal : CONTENT_DEFAULTS.footer.deal,
    },
    reviews: {
      rating: saved.reviews?.rating ?? CONTENT_DEFAULTS.reviews.rating,
      count: saved.reviews?.count ?? CONTENT_DEFAULTS.reviews.count,
      quotes: saved.reviews?.quotes?.length
        ? saved.reviews.quotes
        : CONTENT_DEFAULTS.reviews.quotes,
    },
  };
}

// Anonymous read via the public policy; cached and tagged so the admin
// save action can invalidate instantly.
export const getContent = unstable_cache(
  async (): Promise<SiteContent> => {
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } },
      );
      const { data } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "site")
        .maybeSingle();
      return merge((data?.value as Partial<SiteContent>) ?? null);
    } catch {
      return CONTENT_DEFAULTS;
    }
  },
  ["site-content"],
  { tags: ["site-content"], revalidate: 300 },
);
