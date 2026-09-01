/**
 * Drafting a listing description from the photos on the car and the specs
 * already typed into the form.
 *
 * All of it is pure so the prompt can be tested rather than eyeballed: what
 * facts get sent, what the model is told it may not claim, and which photos
 * go with them. The route in app/api/admin/draft-description does the talking.
 *
 * The rule the whole prompt turns on: the draft may only state what is in the
 * photographs or in the fields below. The site's whole proposition is that a
 * fault is named in the description, which is worth nothing if the copy is
 * inventing a full service history or a feature the car hasn't got.
 */

import { formatPrice, formatKm } from "@/lib/format";
import type { ServiceHistory } from "@/lib/types";

/**
 * Enough angles to describe the car (outside, inside, wheels) without paying
 * for the whole gallery. The hero shot is always first, as it is on the form.
 */
export const MAX_DRAFT_PHOTOS = 5;

export interface DraftSpec {
  make: string;
  model: string;
  badge?: string;
  year?: number;
  price?: number;
  odometer_km?: number;
  body_type?: string;
  transmission?: string;
  fuel?: string;
  drivetrain?: string;
  colour?: string;
  seats?: number;
  service_history?: ServiceHistory;
  ppsr_clear?: boolean;
  inspection_summary?: string;
  adams_take?: string;
}

const SERVICE_HISTORY_WORDS: Record<ServiceHistory, string> = {
  full: "full books, every service stamped",
  partial: "partial history, some receipts",
  none: "no service records",
  unknown: "service history still being confirmed",
};

/**
 * The specs as the dealer has them, one per line. Empty fields are left out
 * rather than sent as blanks: a line reading "Colour: unknown" invites the
 * model to write about not knowing the colour.
 */
export function factSheet(spec: DraftSpec): string {
  const lines: string[] = [];
  const name = [spec.year, spec.make, spec.model, spec.badge]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (name) lines.push(`Car: ${name}`);
  if (spec.price) lines.push(`Price: ${formatPrice(spec.price)}`);
  if (typeof spec.odometer_km === "number") {
    lines.push(`Odometer: ${formatKm(spec.odometer_km)}`);
  }
  if (spec.body_type) lines.push(`Body: ${spec.body_type}`);
  if (spec.transmission) lines.push(`Transmission: ${spec.transmission}`);
  if (spec.fuel) lines.push(`Fuel: ${spec.fuel}`);
  if (spec.drivetrain) lines.push(`Drivetrain: ${spec.drivetrain}`);
  if (spec.colour) lines.push(`Colour: ${spec.colour}`);
  if (spec.seats) lines.push(`Seats: ${spec.seats}`);
  if (spec.service_history) {
    lines.push(`Service history: ${SERVICE_HISTORY_WORDS[spec.service_history]}`);
  }
  lines.push(
    spec.ppsr_clear
      ? "PPSR: checked and clear"
      : "PPSR: not confirmed clear yet",
  );
  if (spec.inspection_summary) {
    lines.push(`Inspection notes from the dealer: ${spec.inspection_summary}`);
  }
  if (spec.adams_take) {
    lines.push(`The dealer's own take (already on the listing, don't repeat it): ${spec.adams_take}`);
  }
  return lines.join("\n");
}

/**
 * Two live listings, as written by the dealer. Cheaper and far more accurate
 * than describing the voice in adjectives: length, rhythm and what earns a
 * sentence are all in the examples.
 */
const HOUSE_EXAMPLES = `Example of a description on this site:
"One-owner SR5 dual cab with the 2.8 turbo diesel. Towbar, tub liner and side steps already fitted. Serviced on the dot at Toyota since new, and the books prove it."

Another:
"Touring AWD in the red everyone wants. Leather, heads-up display, radar cruise. Full Mazda service history."`;

export function draftSystemPrompt(): string {
  return `You write the listing descriptions for Car Marketplace, a small independent used-car dealer on the Gold Coast / Northern NSW border. The dealer picks every car themselves and the site's whole promise is that the listing tells the truth about it.

You are given the photographs of one car and the specs the dealer has typed in. Write the description that goes on that car's page.

${HOUSE_EXAMPLES}

Hard rules about facts:
- Only state what you can see in the photographs or read in the specs. Nothing else.
- Never invent a service history, a PPSR result, an owner count, a warranty, an accident record, or a feature you cannot see. If the specs say the service history or PPSR is not confirmed, do not claim it is.
- If you can see a mark, a scuff, worn tyres or wear inside, you may name it plainly. That is the site's whole point. Never hide it and never dress it up.
- Do not repeat the price or the odometer reading. Both sit next to this text on the page.
- Do not invent a rego, a VIN, a location, a phone number or a date.

How to write it:
- Two to four short sentences, 40 to 90 words. Plain Australian English.
- Lead with what the car is and the thing a buyer would notice first. Then the fitted extras or condition worth naming.
- Write like a dealer talking on the lot, not like an ad. No sales patter, no exclamation marks, no "look no further", no "priced to sell".
- No em dashes. No adverbs. No headings, no bullets, no markdown, no quote marks around the whole thing.
- Don't open with the year and make as a label ("2021 Toyota Hilux SR5 —"). The heading above already says it.
- Return the description text only. No preamble, no sign-off, no alternatives, no notes about what you did.`;
}

/** The turn's instruction, sitting after the photos. */
export function draftInstruction(spec: DraftSpec, photoCount: number): string {
  const shots =
    photoCount === 0
      ? "There are no photographs on this car yet, so work from the specs alone and describe only what they tell you."
      : photoCount === 1
        ? "The photograph above is of this car."
        : `The ${photoCount} photographs above are all of this car. The first is the hero shot.`;

  return `${shots}

Here is what the dealer has recorded:
${factSheet(spec)}

Write the description.`;
}

/**
 * Photo URLs the API is allowed to be pointed at: the project's own Supabase
 * storage, plus the placeholder host the demo stock still uses. Same two
 * hosts next.config.ts lets <Image> load, derived the same way.
 *
 * This route is admin-only, so the gate is not the worry. Handing Anthropic an
 * arbitrary URL a request body asked us to fetch is, and an allowlist costs a
 * line.
 */
export function allowedPhotoHosts(): string[] {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hosts = ["picsum.photos"];
  if (supabase) {
    try {
      hosts.push(new URL(supabase).hostname);
    } catch {
      // A malformed env var just means storage photos are skipped.
    }
  }
  return hosts;
}

/** The photos worth sending: https, on an allowed host, hero first, capped. */
export function pickPhotos(urls: string[], hosts = allowedPhotoHosts()): string[] {
  const kept: string[] = [];
  for (const url of urls) {
    if (kept.length >= MAX_DRAFT_PHOTOS) break;
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (parsed.protocol !== "https:") continue;
    if (!hosts.includes(parsed.hostname)) continue;
    if (kept.includes(url)) continue;
    kept.push(url);
  }
  return kept;
}
