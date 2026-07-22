import { getContent } from "@/lib/content";

// Sitewide AutoDealer structured data. Drives the local rich result —
// business name, contact, opening hours and the review stars — in Google.
// Placeholder content (unconfirmed address/email) is skipped so we never
// publish bracketed junk into schema.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// A value still wrapped in [brackets] or flagged pending/confirmed is a
// placeholder — treat it as absent.
function real(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  if (!t || /[[\]]|to be confirmed|pending|tbc|placeholder/i.test(t)) return undefined;
  return t;
}

function to24(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ?? "00";
  const ap = m[3].toLowerCase();
  if (ap === "pm" && h !== 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

function dayIndex(label: string): number {
  const key = label.trim().slice(0, 3).toLowerCase();
  return DAYS.findIndex((d) => d.slice(0, 3).toLowerCase() === key);
}

function expandDays(label: string): string[] {
  const parts = label.split(/[–—-]/).map((s) => s.trim());
  if (parts.length === 1) {
    const i = dayIndex(parts[0]);
    return i >= 0 ? [DAYS[i]] : [];
  }
  const a = dayIndex(parts[0]);
  const b = dayIndex(parts[1]);
  if (a < 0 || b < 0) return [];
  return DAYS.slice(a, b + 1) as unknown as string[];
}

function openingHours(hours: { days: string; hours: string }[]) {
  const spec = [];
  for (const row of hours) {
    if (/closed/i.test(row.hours)) continue;
    const [openRaw, closeRaw] = row.hours.split(/[–—-]/).map((s) => s.trim());
    const opens = openRaw && to24(openRaw);
    const closes = closeRaw && to24(closeRaw);
    const days = expandDays(row.days);
    if (!opens || !closes || days.length === 0) continue;
    spec.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens,
      closes,
    });
  }
  return spec;
}

export default async function SiteJsonLd() {
  const { contact, phone, reviews } = await getContent();

  const telephone = phone.tel?.replace(/^tel:/, "");
  const street = real(contact.address?.split("\n")[0]);
  const email = real(contact.email);
  const hoursSpec = openingHours(contact.hours ?? []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${siteUrl}/#dealer`,
    name: "Adam Hall Buy My Car",
    description:
      "Hand-picked used cars across the Gold Coast, Brisbane and Northern Rivers with transparent pricing, honest condition reports and fast settlements.",
    url: siteUrl,
    logo: `${siteUrl}/assets/logos/logo-black.svg`,
    image: `${siteUrl}/brand/home-hero.jpg`,
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    priceRange: "$$",
    areaServed: "Gold Coast, Brisbane & Northern Rivers",
    address: {
      "@type": "PostalAddress",
      ...(street ? { streetAddress: street } : {}),
      addressRegion: "NSW",
      addressCountry: "AU",
    },
    ...(hoursSpec.length ? { openingHoursSpecification: hoursSpec } : {}),
    ...(reviews.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviews.rating,
            reviewCount: reviews.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
