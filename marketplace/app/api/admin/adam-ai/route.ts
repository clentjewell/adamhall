import { createClient } from "@/lib/supabase/server";
import { getContent } from "@/lib/content";

// Adam AI — an admin-only assistant that answers anything about running the
// Adam Hall "Buy My Car" business: social media guidance, marketing, listing
// copy, customer replies, pricing sense-checks, and general advice. It runs
// on Claude (Anthropic Messages API) and is grounded in a live snapshot of
// the yard's stock and the current site copy.
//
// We call the API over raw fetch rather than the SDK: this handler runs in
// the Cloudflare Worker runtime, and a zero-dependency streaming proxy keeps
// the bundle small and avoids edge-bundling surprises.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-8";

type ChatMessage = { role: "user" | "assistant"; content: string };

function bad(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function buildSnapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  try {
    const [{ data: cars }, { data: subs }, content] = await Promise.all([
      supabase.from("cars").select("make, model, year, price, status"),
      supabase.from("submissions").select("status"),
      getContent(),
    ]);

    const lines: string[] = [];

    if (cars && cars.length) {
      const live = cars.filter((c) => c.status === "published");
      const prices = live.map((c) => c.price).filter((p): p is number => !!p);
      const money = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;
      lines.push(
        `Cars on the lot: ${live.length} published` +
          (prices.length
            ? ` (from ${money(Math.min(...prices))} to ${money(Math.max(...prices))})`
            : ""),
      );
      const makes = [...new Set(live.map((c) => c.make).filter(Boolean))];
      if (makes.length) lines.push(`Makes in stock: ${makes.join(", ")}`);
      const recent = live
        .slice(0, 8)
        .map((c) => `${c.year ?? ""} ${c.make} ${c.model}`.trim())
        .filter(Boolean);
      if (recent.length) lines.push(`Sample listings: ${recent.join("; ")}`);
    } else {
      lines.push("Cars on the lot: none published yet.");
    }

    if (subs && subs.length) {
      const open = subs.filter(
        (s) => s.status !== "settled" && s.status !== "declined",
      ).length;
      lines.push(`Sell-my-car enquiries: ${subs.length} total, ${open} still open.`);
    }

    if (content?.phone?.display) lines.push(`Business phone: ${content.phone.display}`);
    if (content?.hero?.headline) lines.push(`Current homepage headline: "${content.hero.headline}"`);

    return lines.join("\n");
  } catch {
    return "Live business data is temporarily unavailable.";
  }
}

function systemPrompt(snapshot: string): string {
  return `You are Adam AI — the in-house AI offsider for Adam Hall, who runs "Buy My Car", a solo used-car dealership in Northern NSW / the Tweed–Gold Coast border.

Your job is to help Adam run and grow the business. You answer anything he throws at you: social media posts and content ideas, marketing and local advertising, writing or sharpening car listings, replying to customers and hagglers, pricing gut-checks, follow-up and negotiation tactics, day-to-day operations, and general small-business questions.

Here is a live snapshot of Adam's business right now — use it to make your answers concrete and specific:
${snapshot}

How to answer:
- Talk like a sharp mate who knows cars and knows selling — plain Australian English, direct, practical. Adam is one bloke doing everything himself, so respect his time.
- Lead with the useful bit. Give him something he can actually use or post today, not a lecture. When he asks for social content, write the actual caption/post, not a description of one.
- Be specific to a solo car dealer and to his actual stock when it's relevant. Skip generic corporate advice.
- Keep it tight. Use short paragraphs or a few bullets, not walls of text. No filler, no "as an AI", no over-hedging.
- Never invent facts about his cars, prices, licence, or customers beyond the snapshot above — if you don't know, say so or ask.
- Don't use em-dashes as connectors, don't open with "Great question" or "Certainly", and don't pad with throat-clearing. Just help.`;
}

export async function POST(req: Request) {
  // Admin gate — same allowlist check as requireAdmin, but this is an API
  // route so we return 401 rather than redirecting.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return bad(401, "Not signed in.");
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!adminRow) return bad(403, "Not authorised.");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return bad(
      503,
      "Adam AI isn't switched on yet. Add an ANTHROPIC_API_KEY secret in Cloudflare and it'll come to life.",
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return bad(400, "Bad request.");
  }
  const messages = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return bad(400, "No message to answer.");
  }

  const snapshot = await buildSnapshot(supabase);

  const upstream = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt(snapshot),
      messages,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("adam-ai upstream error:", upstream.status, detail.slice(0, 300));
    return bad(502, "Adam AI couldn't reach Claude just now. Try again in a moment.");
  }

  // Parse Anthropic's SSE and re-emit just the text deltas as a plain stream,
  // so the client doesn't have to understand the event protocol.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const json = dataLine.slice(5).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const evt = JSON.parse(json);
              if (
                evt.type === "content_block_delta" &&
                evt.delta?.type === "text_delta" &&
                evt.delta.text
              ) {
                controller.enqueue(encoder.encode(evt.delta.text));
              }
            } catch {
              // ignore malformed keep-alive lines
            }
          }
        }
      } catch (err) {
        console.error("adam-ai stream error:", err);
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
