import { z } from "zod";
import { apiError, requireAdminApi } from "@/lib/admin";
import {
  ANTHROPIC_MESSAGES_URL,
  anthropicHeaders,
  relayTextDeltas,
  textStreamResponse,
} from "@/lib/anthropic";
import {
  draftInstruction,
  draftSystemPrompt,
  pickPhotos,
  type DraftSpec,
} from "@/lib/listing-draft";

/**
 * Draft a listing description from the car's photos and the specs the dealer
 * has typed into the form.
 *
 * The dealer writes the description last and it is the slowest field on the
 * page, so this reads the photographs that were just uploaded, takes the specs
 * from the form as they stand (unsaved, which is the point: this runs while the
 * listing is still a blank draft), and streams a draft back into the textarea.
 * It is a draft: nothing is saved until the dealer saves the form, and the
 * previous text is kept so a bad draft can be undone.
 *
 * lib/listing-draft.ts holds the prompt and the rule it turns on, which is
 * that the copy may only state what is in the photos or the fields.
 */

const MODEL = "claude-opus-5";

// Room for the description and for whatever thinking precedes it. The copy
// itself is under a hundred words, so this is a ceiling, not a target.
const MAX_TOKENS = 4096;

const specSchema = z.object({
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  badge: z.string().trim().max(60).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  price: z.coerce.number().positive().max(1_000_000).optional(),
  odometer_km: z.coerce.number().int().min(0).max(2_000_000).optional(),
  body_type: z.string().trim().max(40).optional(),
  transmission: z.string().trim().max(40).optional(),
  fuel: z.string().trim().max(40).optional(),
  drivetrain: z.string().trim().max(20).optional(),
  colour: z.string().trim().max(40).optional(),
  seats: z.coerce.number().int().min(1).max(12).optional(),
  service_history: z.enum(["full", "partial", "none", "unknown"]).optional(),
  ppsr_clear: z.boolean().optional(),
  inspection_summary: z.string().trim().max(1000).optional(),
  adams_take: z.string().trim().max(600).optional(),
});

const bodySchema = z.object({
  spec: specSchema,
  photos: z.array(z.string().max(600)).max(24).default([]),
});

export async function POST(req: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return apiError(
      503,
      "Drafting isn't switched on yet. Add an ANTHROPIC_API_KEY secret in Cloudflare and it'll come to life.",
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const result = bodySchema.safeParse(await req.json());
    if (!result.success) {
      return apiError(400, "Fill in at least the make and model first.");
    }
    parsed = result.data;
  } catch {
    return apiError(400, "Bad request.");
  }

  const spec: DraftSpec = parsed.spec;
  const photos = pickPhotos(parsed.photos);

  // Photos first, each labelled, then the instruction. The labels are what let
  // the copy refer to the hero shot rather than to "an image".
  const content: unknown[] = [];
  photos.forEach((url, i) => {
    content.push({
      type: "text",
      text: i === 0 ? "Photo 1, the hero shot:" : `Photo ${i + 1}:`,
    });
    content.push({ type: "image", source: { type: "url", url } });
  });
  content.push({
    type: "text",
    text: draftInstruction(spec, photos.length),
  });

  const upstream = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // A short piece of copy off a handful of photos. Medium keeps the wait
      // down without costing the model the judgement to spot a scuff.
      output_config: { effort: "medium" },
      thinking: { type: "adaptive" },
      system: draftSystemPrompt(),
      messages: [{ role: "user", content }],
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("draft-description upstream error:", upstream.status, detail.slice(0, 300));
    return apiError(502, "Couldn't reach Claude just now. Try again in a moment.");
  }

  return textStreamResponse(relayTextDeltas(upstream.body, "draft-description"));
}
