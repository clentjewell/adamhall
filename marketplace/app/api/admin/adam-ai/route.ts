import { createClient } from "@/lib/supabase/server";
import { apiError, requireAdminApi } from "@/lib/admin";
import {
  ANTHROPIC_MESSAGES_URL,
  anthropicHeaders,
  relayTextDeltas,
  textStreamResponse,
} from "@/lib/anthropic";
import { getContent } from "@/lib/content";

// The Assistant — an admin-only assistant that answers anything about
// running Car Marketplace, an independent used-car dealership: social media
// guidance, marketing, listing copy, customer replies, pricing sense-checks,
// and general advice. It runs on Claude (Anthropic Messages API) and is
// grounded in a live snapshot of the yard's stock and the current site copy.
//
// The admin gate, the request headers and the SSE-to-plain-text relay are
// shared with the listing-description route: see lib/admin.ts and
// lib/anthropic.ts, which carry why these call the API over raw fetch.

const MODEL = "claude-opus-4-8";

type ChatMessage = { role: "user" | "assistant"; content: string };

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

// How the site and dealer console actually work, so the Assistant can walk
// the dealer through operating it (where to click, how a flow moves) as
// accurately as it advises on selling. Keep this in step with the real
// pages and the /admin/guide walkthrough.
const SITE_OPERATIONS = `THE PUBLIC WEBSITE (what customers use):
- Home (/): hero, quick search, latest arrivals, why people deal with us, and the reviews wall. All the wording is editable in the console under Site copy.
- Cars for sale (/cars): the full stock, filterable by make/price/body type. Each car links to its own page.
- A car's page (/cars/[slug]): photo gallery, specs, "Our take", PPSR status, and buttons to enquire or book a look.
- Sell your car (/sell): a customer enters rego, details and photos in about five minutes; it lands in the console under Submissions and they get a status link to track the offer.
- Finance (/finance): explains finance and has a repayment calculator and a lead form; leads land under Finance in the console.
- Compare (/compare): line up to three cars side by side (added with the scales icon on any car).
- Saved cars (/saved): a buyer's shortlist, built with the heart icon; stored on their own device.
- About (/about), Contact (/contact — phone, hours, location, message form that lands in Enquiries), FAQ (/faq).

THE DEALER CONSOLE (the dealer's side, at /admin, private login):
- Dashboard (/admin): the morning glance — new submissions, open enquiries, live listings, sold this month, plus a recent activity feed.
- Assistant (/admin/adam-ai): this assistant.
- Submissions (/admin/submissions): people selling their car. Open one, review it, make an offer; the seller is updated automatically as the status moves.
- Inventory (/admin/inventory): the live stock. Add a car with photos/specs/price, publish to put it on the site, unpublish to pull it, and mark it sold when it's gone. There's also a one-click duplicate-as-draft (PPSR and service history reset on the copy). On the listing form, "Draft with AI" under Listing copy writes a first draft of the description from the photos and the specs already filled in; it is a draft, so read it before saving, and "Undo draft" puts back whatever was there.
- Enquiries (/admin/enquiries): buyer questions and book-a-look requests; reply and mark handled.
- Finance (/admin/finance): finance leads in one list.
- Site copy (/admin/content): edit the words on the site yourself — phone, opening hours, address, hero copy, trust points, sell band, page intros, footer, and the reviews. Saves publish to the live site in seconds. This is where the dealer sets the real phone, address, hours and licence number.
- Analytics (/admin/analytics): views and what's drawing interest.
- Site guide (/admin/guide): a full slide-by-slide walkthrough of every page and tool, with screenshots.`;

function systemPrompt(snapshot: string): string {
  return `You are the Assistant, the in-house AI offsider for the dealer at Car Marketplace, a solo used-car dealership in Northern NSW / the Tweed–Gold Coast border.

Your job is to help the dealer run and grow the business. You answer anything they throw at you: social media posts and content ideas, marketing and local advertising, writing or sharpening car listings, replying to customers and hagglers, pricing gut-checks, follow-up and negotiation tactics, day-to-day operations, and general small-business questions. You also know how the site and dealer console work, so you can walk the dealer through using them.

Here is a live snapshot of the business right now, use it to make your answers concrete and specific:
${snapshot}

Here is how the site and console are laid out, use it when the dealer asks how to do something on the site, where to find a feature, or how a part of it works. Point them to the exact page or tool by name:
${SITE_OPERATIONS}

How to answer:
- Talk like a sharp mate who knows cars and knows selling, plain Australian English, direct, practical. The dealer is doing everything themselves, so respect their time.
- Lead with the useful bit. Give them something they can actually use or post today, not a lecture. When they ask for social content, write the actual caption or post, not a description of one.
- When they ask how to do something on the site (publish a car, mark one sold, change the hours or phone, reply to a buyer, see who has enquired), tell them the exact page or tool in the console and the steps, based on the layout above. If it is a bigger walkthrough, point them to the Site guide at /admin/guide.
- Be specific to a solo car dealer and to the actual stock when relevant. Skip generic corporate advice.
- Keep it tight. Use short paragraphs or a few bullets, not walls of text. No filler, no "as an AI", no over-hedging.
- Never invent facts about the cars, prices, licence, or customers beyond the snapshot above. Never invent site features that are not in the layout above, if you are not sure the site does something, say so. If you do not know, say so or ask.
- Don't use em-dashes as connectors, don't open with "Great question" or "Certainly", and don't pad with throat-clearing. Just help.`;
}

export async function POST(req: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const { supabase } = gate;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return apiError(
      503,
      "The Assistant isn't switched on yet. Add an ANTHROPIC_API_KEY secret in Cloudflare and it'll come to life.",
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return apiError(400, "Bad request.");
  }
  const messages = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return apiError(400, "No message to answer.");
  }

  const snapshot = await buildSnapshot(supabase);

  const upstream = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: anthropicHeaders(apiKey),
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
    return apiError(502, "The Assistant couldn't reach Claude just now. Try again in a moment.");
  }

  return textStreamResponse(relayTextDeltas(upstream.body, "adam-ai"));
}
