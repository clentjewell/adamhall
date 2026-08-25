/**
 * The bits of talking to Claude that every route here needs.
 *
 * We call the Messages API over raw fetch rather than through the SDK: these
 * handlers run in the Cloudflare Worker runtime, and a zero-dependency proxy
 * keeps the bundle small and avoids edge-bundling surprises. The Assistant
 * route has done it this way since it was built; this file is that code moved
 * out so the second caller (drafting a listing description) shares it instead
 * of copying it.
 *
 * Each route still names its own model. They are different jobs — a chat that
 * runs all day against a one-shot piece of copy — and pinning them together
 * would mean changing one to change the other.
 */

export const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
export const ANTHROPIC_VERSION = "2023-06-01";

export function anthropicHeaders(apiKey: string): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
  };
}

/**
 * Parse Anthropic's SSE and re-emit just the text deltas as a plain stream,
 * so the browser doesn't have to understand the event protocol.
 *
 * Thinking blocks arrive as their own event type and are skipped here, which
 * is what we want: the caller asked for copy, not the reasoning behind it.
 */
export function relayTextDeltas(
  upstream: ReadableStream<Uint8Array>,
  label: string,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
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
        console.error(`${label} stream error:`, err);
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

/** A streamed run of text, not a document — never cached. */
export function textStreamResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
