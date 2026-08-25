import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { relayTextDeltas } from "../lib/anthropic";

/** An SSE body as Anthropic sends it, chopped into arbitrary network chunks. */
function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

async function read(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

const delta = (text: string) =>
  `event: content_block_delta\ndata: ${JSON.stringify({
    type: "content_block_delta",
    index: 0,
    delta: { type: "text_delta", text },
  })}\n\n`;

describe("relayTextDeltas", () => {
  test("emits the text deltas in order and nothing else", async () => {
    const out = await read(
      relayTextDeltas(
        sseStream([
          'event: message_start\ndata: {"type":"message_start","message":{"id":"m"}}\n\n',
          delta("One-owner SR5 "),
          delta("dual cab."),
          'event: message_stop\ndata: {"type":"message_stop"}\n\n',
        ]),
        "test",
      ),
    );
    assert.equal(out, "One-owner SR5 dual cab.");
  });

  test("stitches an event split across two chunks", async () => {
    const whole = delta("Touring AWD in the red everyone wants.");
    const cut = Math.floor(whole.length / 2);
    const out = await read(
      relayTextDeltas(sseStream([whole.slice(0, cut), whole.slice(cut)]), "test"),
    );
    assert.equal(out, "Touring AWD in the red everyone wants.");
  });

  test("skips thinking deltas", async () => {
    const thinking = `event: content_block_delta\ndata: ${JSON.stringify({
      type: "content_block_delta",
      index: 0,
      delta: { type: "thinking_delta", thinking: "weighing the photos" },
    })}\n\n`;
    const out = await read(
      relayTextDeltas(sseStream([thinking, delta("Clean example.")]), "test"),
    );
    assert.equal(out, "Clean example.");
  });

  test("ignores keep-alives and malformed data lines", async () => {
    const out = await read(
      relayTextDeltas(
        sseStream([": ping\n\n", "event: x\ndata: {oops\n\n", delta("Still fine.")]),
        "test",
      ),
    );
    assert.equal(out, "Still fine.");
  });

  test("comes back empty rather than throwing when the model says nothing", async () => {
    const out = await read(
      relayTextDeltas(
        sseStream(['event: message_stop\ndata: {"type":"message_stop"}\n\n']),
        "test",
      ),
    );
    assert.equal(out, "");
  });
});
