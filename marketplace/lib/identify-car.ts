/**
 * Identifying a car from its photographs, for the "Fill from photos" button
 * on the listing form.
 *
 * The same honesty rule the description drafting lives by, applied to specs:
 * the model may fill only what a photograph can actually show. Make, model,
 * body type and colour are fair game — Adam's word is that the AI can make
 * the assumption and he adjusts it — but an odometer reading or a price
 * guessed from a photo would be an invented fact wearing a number, so those
 * fields are not even in the schema.
 *
 * Pure so the prompt and the parsing can be tested: the route in
 * app/api/admin/identify-car does the talking.
 */

import { z } from "zod";

/** What a photograph is allowed to assert. Everything optional: an absent
    field means "could not tell", never "none". */
export const identificationSchema = z
  .object({
    make: z.string().trim().min(1).max(60).optional(),
    model: z.string().trim().min(1).max(60).optional(),
    badge: z.string().trim().min(1).max(60).optional(),
    body_type: z.string().trim().min(1).max(40).optional(),
    colour: z.string().trim().min(1).max(40).optional(),
    fuel: z.string().trim().min(1).max(40).optional(),
    transmission: z.string().trim().min(1).max(40).optional(),
    seats: z.number().int().min(1).max(12).optional(),
    /** A generation is a range of years; a single year is min === max. */
    year_min: z.number().int().min(1950).max(2100).optional(),
    year_max: z.number().int().min(1950).max(2100).optional(),
  })
  .strict();

export type Identification = z.infer<typeof identificationSchema>;

export function identifySystemPrompt(): string {
  return `You identify used cars from their photographs for a dealer's listing form. You are given several photos of one car. Work out what the car is and answer with a single JSON object, nothing else.

Fields — include a field ONLY when the photographs give you real grounds for it, and leave it out entirely when they do not:
- "make" and "model": from the car's design, grille, lights and any visible badging.
- "badge": the variant (like "SR5", "XLT", "Touring") only if it is readable on the car or certain from the trim.
- "body_type": one word from this list where one fits: Ute, SUV, Hatch, Sedan, Wagon, Van, Coupe, Convertible. This one is safe to judge from the silhouette alone.
- "colour": a plain colour name a buyer would say ("White", "Silver", "Grey", "Blue", "Red", "Black"). Not paint-brochure names unless the badge states one.
- "fuel": only with visible evidence — a Hybrid or EV badge, a charging port, a diesel model designation. Never from vibes.
- "transmission": only if an interior shot shows the shifter clearly.
- "seats": only if the cabin is visible enough to count rows.
- "year_min" and "year_max": the model-generation range this car's design belongs to. If a facelift pins it tighter, narrow the range. If you are sure of the exact year, set both to it.

Hard rules:
- Never guess odometer, price, condition, service history or anything a photograph cannot show. Those are not in the schema and must not appear.
- If the photos show what might be two different cars, or no car, return {} and nothing else.
- Answer with the JSON object only. No prose, no markdown fences, no explanation.`;
}

/** The turn's instruction, sent after the photos. */
export function identifyInstruction(photoCount: number): string {
  return photoCount === 1
    ? "Identify the car in the photograph above. JSON only."
    : `The ${photoCount} photographs above are all of the same car. Identify it. JSON only.`;
}

/**
 * The model is told JSON-only, but a parser that trusts that is a parser
 * that breaks: fences and stray prose are stripped, and anything that does
 * not validate comes back null rather than half-trusted.
 */
export function parseIdentification(text: string): Identification | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  const result = identificationSchema.safeParse(raw);
  if (!result.success) return null;
  const id = { ...result.data };
  // A range that runs backwards is a confusion, not information.
  if (id.year_min && id.year_max && id.year_min > id.year_max) {
    delete id.year_min;
    delete id.year_max;
  }
  return id;
}
