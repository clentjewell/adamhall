import { z } from "zod";
import { apiError, requireAdminApi } from "@/lib/admin";
import { ANTHROPIC_MESSAGES_URL, anthropicHeaders } from "@/lib/anthropic";
import { pickPhotos } from "@/lib/listing-draft";
import {
  identifyInstruction,
  identifySystemPrompt,
  parseIdentification,
} from "@/lib/identify-car";

/**
 * Identify a car from its photographs: the "Fill from photos" button on the
 * listing form. Claude looks at the photos already uploaded and answers with
 * the specs a photograph can actually show — make, model, body type, colour,
 * a year range — which the form then writes into its own EMPTY fields for
 * the dealer to adjust. Nothing is saved until the form is saved.
 *
 * One round trip and one small JSON answer, so unlike the description this
 * is not streamed. lib/identify-car.ts holds the prompt, the schema, and
 * the parsing.
 */

const MODEL = "claude-opus-5";
const MAX_TOKENS = 2048;

const bodySchema = z.object({
  photos: z.array(z.string().max(600)).min(1).max(24),
});

export async function POST(req: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return apiError(
      503,
      "Identifying isn't switched on yet. Add an ANTHROPIC_API_KEY secret in Cloudflare and it'll come to life.",
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const result = bodySchema.safeParse(await req.json());
    if (!result.success) return apiError(400, "Add at least one photo first.");
    parsed = result.data;
  } catch {
    return apiError(400, "Bad request.");
  }

  const photos = pickPhotos(parsed.photos);
  if (photos.length === 0) return apiError(400, "Add at least one photo first.");

  const content: unknown[] = photos.map((url) => ({
    type: "image",
    source: { type: "url", url },
  }));
  content.push({ type: "text", text: identifyInstruction(photos.length) });

  const upstream = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: "medium" },
      thinking: { type: "adaptive" },
      system: identifySystemPrompt(),
      messages: [{ role: "user", content }],
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("identify-car upstream error:", upstream.status, detail.slice(0, 300));
    return apiError(502, "Couldn't reach Claude just now. Try again in a moment.");
  }

  const message = (await upstream.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text =
    message.content?.find((b) => b.type === "text" && b.text)?.text ?? "";
  const fields = parseIdentification(text);

  if (!fields) {
    console.error("identify-car unparseable answer:", text.slice(0, 300));
    return apiError(502, "Claude's answer didn't make sense. Try again.");
  }

  return new Response(JSON.stringify({ fields }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
