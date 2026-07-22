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
  about: {
    title: string;
    sub: string;
    sections: { heading: string; body: string }[];
  };
  contact: {
    title: string;
    sub: string;
    email: string;
    address: string;
    hours: { days: string; hours: string }[];
  };
  faq: {
    title: string;
    sub: string;
    items: { group: string; q: string; a: string }[];
  };
  financePage: {
    title: string;
    sub: string;
    steps: { title: string; body: string }[];
  };
  legal: {
    privacy: string;
    terms: string;
    financeDisclaimer: string;
    websiteDisclaimer: string;
    complaints: string;
  };
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
  about: {
    title: "The bloke behind the cars",
    sub: "No sales team. No head office. Just one person who buys the cars, checks them and stands behind what he says about them.",
    sections: [
      {
        heading: "How Adam works",
        body: "Every car that comes onto this yard has been picked, checked and priced by Adam personally. Not a buyer somewhere else in the business, not an algorithm. If a car isn't worth putting his name on, it doesn't go up for sale. What we say about a car in the listing is what you get when you turn up to look at it.",
      },
      {
        heading: "Selling a car?",
        body: "Same rules apply the other way round. Send through the rego and a few photos, Adam looks at it himself and comes back with a real number within one business day. No listing fees, no strangers traipsing through your driveway.",
      },
    ],
  },
  contact: {
    title: "Talk to a human",
    sub: "No call centre, no ticket number. Ring or drop by and you'll get Adam or someone who actually knows the cars.",
    email: "[sales@ email to be confirmed]",
    address: "[street address to be confirmed]\nNorthern NSW, on the Tweed–Gold Coast border",
    hours: [
      { days: "Monday – Friday", hours: "8:30am – 5:30pm" },
      { days: "Saturday", hours: "8:30am – 2:00pm" },
      { days: "Sunday", hours: "Closed" },
    ],
  },
  faq: {
    title: "Questions, answered straight",
    sub: "The stuff people ask most, before they ever ring us.",
    items: [
      {
        group: "Buying",
        q: "Are the prices negotiable?",
        a: "The price is the price. We cut the haggle out, not corners. Every car is priced to sell from the start, so there's no invisible markup sitting there waiting for you to talk it down.",
      },
      {
        group: "Buying",
        q: "What's a PPSR check, and why does it matter?",
        a: "PPSR stands for Personal Property Securities Register. It tells you whether a car has money owing on it, has been written off, or is reported stolen. Every car on this lot is PPSR checked before it's listed, and the certificate is available on request.",
      },
      {
        group: "Buying",
        q: "Can I test drive a car before I buy it?",
        a: "Yes, always. Bring your licence and take it for a proper drive. If you want your own mechanic to look it over first, that's fine too. Most buyers don't need to, but it's your money.",
      },
      {
        group: "Buying",
        q: "Do you offer any kind of warranty?",
        a: "[statutory warranty wording pending legal review]. Ask what applies to the specific car you're looking at before you commit.",
      },
      {
        group: "Buying",
        q: "Is there a deposit or holding policy?",
        a: "[deposit terms pending, confirmed at time of sale]. Ask when you're ready to go ahead and we'll walk you through it.",
      },
      {
        group: "Buying",
        q: "Can I get a mechanical inspection done separately?",
        a: "Of course. Take the car to your own mechanic or an independent inspector before you buy. A car worth buying is a car worth checking.",
      },
      {
        group: "Selling",
        q: "Can I sell my car without buying one?",
        a: "Yes. Plenty of people just want to sell and walk away with cash, no trade needed. Send through your rego and a few photos and Adam will look at it the same way either way.",
      },
      {
        group: "Selling",
        q: "How fast will I actually get paid?",
        a: "Adam personally reviews every car and comes back with a real offer within one business day. If you accept, settlement happens the same day the paperwork clears, usually that day or the next.",
      },
      {
        group: "Selling",
        q: "Do you take trade-ins?",
        a: "Yes. If you're buying a car and selling one at the same time, tell us upfront and we'll value both at once.",
      },
      {
        group: "Selling",
        q: "What if my car isn't perfect, like high kms, a dent, or no books?",
        a: "Tell us straight up. It won't stop us making an offer, it just affects the number. We'd rather know before we look at it than find out standing in your driveway.",
      },
      {
        group: "Selling",
        q: "Do you buy cars that still have finance owing?",
        a: "Often, yes. Tell us the payout figure when you send through your details and we'll factor it into the offer and handle the payout as part of settlement.",
      },
      {
        group: "Finance & paperwork",
        q: "Can you help me get finance?",
        a: "We can point you toward finance options and give you a rough idea of repayments, but the loan itself comes from the lender, not from us.",
      },
      {
        group: "Finance & paperwork",
        q: "Are the finance numbers on the site a real offer?",
        a: "No. Finance estimates on this site are estimates only, not an offer or a pre-approval. Actual rates and repayments depend on the lender's own criteria and your circumstances.",
      },
      {
        group: "Finance & paperwork",
        q: "What paperwork do I need to bring when I buy?",
        a: "Your driver's licence, and if you're financing, whatever your lender asks for. If you're trading in or selling, bring the rego papers and, if it's financed, your payout figure.",
      },
    ],
  },
  financePage: {
    title: "Finance that's sorted before you shop",
    sub: "Get a feel for the repayments first, then send us the numbers. We'll tell you straight what's realistic. No guesswork, no approval promises until a lender's actually looked at it.",
    steps: [
      {
        title: "Tell us the number",
        body: "Run the calculator, then send through the amount and your details. Two minutes, no paperwork yet.",
      },
      {
        title: "We shop it to our lenders",
        body: "[finance model to be confirmed: in-house / broker] — either way, we come back with a real rate, not a teaser.",
      },
      {
        title: "You sign when the rate's right",
        body: "No pressure to take it. If the number works for you, we settle the paperwork and you drive away.",
      },
    ],
  },
  legal: {
    privacy: `Adam Hall Buy My Car respects your privacy. This policy explains what information we collect through this website, why we collect it, and what you can do if you want it changed or removed.

## What we collect
We collect the information you give us directly, through the forms on this site:

- Enquiry and book-a-look forms: your name, phone number, email and any message about a specific car.
- Sell your car forms: your rego, vehicle details, photos, odometer reading and contact details, so we can make an offer.
- Finance enquiries: basic details needed to provide a rough repayment estimate. We do not collect full credit applications through this site.

## Why we collect it
We use this information to respond to your enquiry, make an offer on a car you're selling, arrange a viewing or test drive, and to keep you updated on stock if you've asked to be. We don't use it for anything beyond running the dealership.

## Where it's stored
Website form data is stored using Supabase, hosted in an Australian (AU) data region. Access is limited to Adam and the systems that run this site.

## We don't sell your data
We don't sell, rent or trade your personal information to anyone. It's used to run this dealership and nothing else.

## Access and deletion
You can ask what information we hold about you, ask us to correct it, or ask us to delete it. Get in touch through the Contact page and we'll sort it out.`,
    terms: `These terms cover your use of this website. By browsing the site or submitting a form, you're agreeing to them.

## Using this site
This website is provided so you can browse current stock, sell a car, and get in touch with Adam Hall Buy My Car. You agree to use it only for those purposes, and not to interfere with how it runs or misuse any form on it.

## Listing accuracy
Every listing is written and checked in good faith, and we make every reasonable effort to describe each car accurately, including any known faults. Details such as specifications, odometer readings and availability can change without notice, and small errors can occur. Always confirm the details that matter to you in person before you buy.

## Pricing
Prices shown are drive-away prices unless a listing states otherwise. Drive-away price includes registration, stamp duty and other on-road costs current at the time of sale, and is subject to change if those government charges change.

## Availability
Cars sell quickly and stock moves fast. A car showing as available on this site may already be sold or under offer by the time you enquire. We'll always tell you straight away if that's the case.`,
    financeDisclaimer: `This page explains what any finance figures, repayment estimates or calculators on this site actually represent.

## Estimates only
Any repayment figures shown on this site are estimates for general guidance only. They are not a quote, not an offer of finance, and not a pre-approval.

## Not an offer or approval
Nothing on this site constitutes a finance offer or a guarantee of approval. Any actual loan is arranged between you and a lender, and is subject to that lender's own assessment.

## Lender criteria apply
Approval, interest rate and loan term all depend on the lender's own credit criteria, your financial circumstances, and the information you provide when you apply. The figures on this site may not reflect what you're ultimately offered.

## Comparison rate
[comparison rate placeholder, e.g. "Comparison rate X.XX% based on a $XX,XXX loan over 5 years. WARNING: This comparison rate is true only for the example given and may not include all fees and charges."] Comparison rate wording must be confirmed against actual lender terms before publication.`,
    websiteDisclaimer: `This page covers a few things worth knowing about the content on this site, beyond the individual car listings themselves.

## Imagery
Photos on individual car listings are of the actual vehicle for sale. Some other imagery on this site, such as background and lifestyle photography used for design purposes, is AI-generated placeholder content pending real photography of the yard and stock. This will be replaced with genuine photos as they're taken.

## Errors and omissions
We take reasonable care to keep this site accurate and current, but errors, outdated details and omissions can happen. If something looks wrong, tell us and we'll fix it. Nothing on this site should be relied on as the final word on a car's condition or a page's content without confirming it with us directly.

## Limitation
To the extent permitted by law, Adam Hall Buy My Car isn't liable for loss arising from reliance on information on this site that turns out to be incomplete or incorrect. This doesn't affect any rights you have under the Australian Consumer Law that can't be excluded.`,
    complaints: `Most problems get sorted with a phone call. Here's how to raise one, and what your options are if it doesn't get resolved.

## Talk to Adam first
This is a one-person dealership, so any concern goes straight to the person who can actually fix it. Call or email through the Contact page and explain what's happened. Most issues are resolved this way, quickly and without fuss.

## If it isn't resolved
If you've spoken with Adam and the matter still isn't sorted to your satisfaction, you can raise it with the relevant consumer affairs body in your state.

- NSW Fair Trading: [phone / website placeholder]
- Queensland Office of Fair Trading: [phone / website placeholder]

## Motor dealer licence
Adam Hall Buy My Car operates under motor dealer licence number [licence number pending]. This licence is what allows a complaint to be escalated to the relevant fair trading authority if it can't be resolved directly with us.`,
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
    about: {
      title: saved.about?.title ?? CONTENT_DEFAULTS.about.title,
      sub: saved.about?.sub ?? CONTENT_DEFAULTS.about.sub,
      sections: saved.about?.sections?.length
        ? saved.about.sections
        : CONTENT_DEFAULTS.about.sections,
    },
    contact: {
      title: saved.contact?.title ?? CONTENT_DEFAULTS.contact.title,
      sub: saved.contact?.sub ?? CONTENT_DEFAULTS.contact.sub,
      email: saved.contact?.email ?? CONTENT_DEFAULTS.contact.email,
      address: saved.contact?.address ?? CONTENT_DEFAULTS.contact.address,
      hours: saved.contact?.hours?.length
        ? saved.contact.hours
        : CONTENT_DEFAULTS.contact.hours,
    },
    faq: {
      title: saved.faq?.title ?? CONTENT_DEFAULTS.faq.title,
      sub: saved.faq?.sub ?? CONTENT_DEFAULTS.faq.sub,
      items: saved.faq?.items?.length ? saved.faq.items : CONTENT_DEFAULTS.faq.items,
    },
    financePage: {
      title: saved.financePage?.title ?? CONTENT_DEFAULTS.financePage.title,
      sub: saved.financePage?.sub ?? CONTENT_DEFAULTS.financePage.sub,
      steps: saved.financePage?.steps?.length
        ? saved.financePage.steps
        : CONTENT_DEFAULTS.financePage.steps,
    },
    legal: {
      privacy: saved.legal?.privacy ?? CONTENT_DEFAULTS.legal.privacy,
      terms: saved.legal?.terms ?? CONTENT_DEFAULTS.legal.terms,
      financeDisclaimer:
        saved.legal?.financeDisclaimer ?? CONTENT_DEFAULTS.legal.financeDisclaimer,
      websiteDisclaimer:
        saved.legal?.websiteDisclaimer ?? CONTENT_DEFAULTS.legal.websiteDisclaimer,
      complaints: saved.legal?.complaints ?? CONTENT_DEFAULTS.legal.complaints,
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
