"use client";

import { useEffect, useRef, useState } from "react";
import { PaperPlaneRight, Sparkle, Warning, ArrowClockwise } from "@phosphor-icons/react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Write me 3 Facebook posts for this week's stock",
  "A buyer says my price is too high. How do I reply?",
  "Give me a listing description for a clean family SUV",
  "What should I be doing to get more cars to sell to me?",
];

export default function AdamAI({ configured }: { configured: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setBusy(true);
    // Placeholder assistant message we stream into.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/admin/adam-ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) {
        const { error: e } = await res.json().catch(() => ({ error: "Something went wrong." }));
        throw new Error(e || "Something went wrong.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch (err) {
      setMessages((m) => m.slice(0, -1)); // drop the empty assistant bubble
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
      taRef.current?.focus();
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="card flex flex-col h-[calc(100dvh-190px)] min-h-[460px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-200 bg-forest-50/60">
        <div className="w-9 h-9 rounded-full bg-forest-600 text-white flex items-center justify-center shrink-0">
          <Sparkle size={18} weight="fill" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold leading-tight">Adam AI</p>
          <p className="text-xs text-stone-500 leading-tight">
            Your in-house offsider — social, marketing, listings, customers
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="ml-auto btn-ghost text-xs shrink-0"
          >
            <ArrowClockwise size={14} weight="bold" />
            New chat
          </button>
        )}
      </div>

      {!configured && (
        <div className="flex items-start gap-2.5 px-5 py-3 bg-amber-50 border-b border-amber-200 text-sm text-amber-900">
          <Warning size={18} weight="fill" className="shrink-0 mt-0.5" />
          <p>
            Adam AI isn&apos;t switched on yet. Add an <code className="font-mono">ANTHROPIC_API_KEY</code>{" "}
            secret in the Cloudflare dashboard and it&apos;ll come to life — no redeploy of your data needed.
          </p>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {empty ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center mb-4">
              <Sparkle size={26} weight="fill" />
            </div>
            <p className="font-display font-bold text-lg">Ask Adam AI anything</p>
            <p className="text-sm text-stone-500 mt-1 mb-5">
              It knows your current stock and site copy. Try one of these:
            </p>
            <div className="grid gap-2 w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={!configured || busy}
                  className="text-left text-sm px-3.5 py-2.5 rounded-lg border border-stone-200 hover:border-forest-300 hover:bg-forest-50/50 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-forest-600 text-white rounded-br-sm"
                    : "bg-stone-100 text-ink rounded-bl-sm"
                }`}
              >
                {m.content || (busy && i === messages.length - 1 ? <TypingDots /> : "")}
              </div>
            </div>
          ))
        )}
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <Warning size={16} weight="fill" className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-stone-200 p-3 flex items-end gap-2"
      >
        <textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          disabled={!configured}
          placeholder={configured ? "Ask about social posts, pricing, a tricky customer…" : "Add ANTHROPIC_API_KEY to enable"}
          className="flex-1 resize-none max-h-32 rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-400 disabled:bg-stone-50"
        />
        <button
          type="submit"
          disabled={!configured || busy || !input.trim()}
          className="btn-primary shrink-0 !px-3.5 !py-2.5 disabled:opacity-40"
          aria-label="Send"
        >
          <PaperPlaneRight size={18} weight="fill" />
        </button>
      </form>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
    </span>
  );
}
