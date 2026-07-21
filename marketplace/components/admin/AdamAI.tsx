"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  PaperPlaneRight,
  Sparkle,
  Warning,
  Plus,
  ClockCounterClockwise,
  Trash,
  X,
} from "@phosphor-icons/react";
import {
  listChats,
  getChat,
  saveChat,
  deleteChat,
  type ChatSummary,
  type ChatTurn,
} from "@/app/actions/adam-ai";

type Msg = ChatTurn;

const SUGGESTIONS = [
  "Write me 3 Facebook posts for this week's stock",
  "A buyer says my price is too high. How do I reply?",
  "Give me a listing description for a clean family SUV",
  "What should I be doing to get more cars to sell to me?",
];

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const s = Math.max(1, Math.round((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export default function AdamAI({ configured }: { configured: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const currentId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const refreshSessions = useCallback(() => {
    listChats()
      .then(setSessions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function newChat() {
    currentId.current = null;
    setMessages([]);
    setError(null);
    setHistoryOpen(false);
    taRef.current?.focus();
  }

  async function openChat(id: string) {
    if (busy) return;
    setError(null);
    setHistoryOpen(false);
    const chat = await getChat(id).catch(() => null);
    if (chat) {
      currentId.current = chat.id;
      setMessages(chat.messages);
    }
  }

  async function removeChat(id: string, e: MouseEvent<HTMLElement>) {
    e.stopPropagation();
    await deleteChat(id).catch(() => {});
    if (currentId.current === id) newChat();
    refreshSessions();
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    let assistant = "";
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
        assistant += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "assistant", content: assistant };
          return copy;
        });
      }
      // Persist the completed exchange, then keep saving into the same row.
      if (assistant.trim()) {
        const full: Msg[] = [...next, { role: "assistant", content: assistant }];
        const { id } = await saveChat({ id: currentId.current, messages: full });
        currentId.current = id;
        refreshSessions();
      }
    } catch (err) {
      setMessages((m) => m.slice(0, -1));
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
      taRef.current?.focus();
    }
  }

  const empty = messages.length === 0;

  const historyList = (
    <div className="flex flex-col h-full">
      <button
        onClick={newChat}
        className="btn-primary justify-center text-sm m-3 mb-2 shrink-0"
      >
        <Plus size={16} weight="bold" />
        New chat
      </button>
      <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
        Recent chats
      </p>
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {sessions.length === 0 ? (
          <p className="px-2 py-3 text-xs text-stone-400">No saved chats yet.</p>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => openChat(s.id)}
              className={`group w-full text-left rounded-lg px-2.5 py-2 transition-colors ${
                currentId.current === s.id ? "bg-forest-50" : "hover:bg-stone-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <p className="flex-1 truncate text-sm font-medium text-ink">{s.title}</p>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeChat(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-opacity shrink-0"
                  aria-label="Delete chat"
                >
                  <Trash size={14} />
                </span>
              </div>
              <p className="text-[11px] text-stone-400">{timeAgo(s.updated_at)}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="card relative flex h-[calc(100dvh-190px)] min-h-[460px] overflow-hidden">
      {/* Recent-chats rail (desktop) */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-stone-200 bg-stone-50/60">
        {historyList}
      </aside>

      {/* Mobile drawer */}
      {historyOpen && (
        <div className="md:hidden absolute inset-0 z-20 flex">
          <div className="w-72 max-w-[80%] bg-paper border-r border-stone-200 shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-stone-200">
              <span className="text-sm font-semibold">Chats</span>
              <button onClick={() => setHistoryOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{historyList}</div>
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setHistoryOpen(false)} />
        </div>
      )}

      {/* Chat panel */}
      <div className="relative flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 bg-forest-50/60">
          <button
            className="md:hidden text-stone-500 -ml-1"
            onClick={() => setHistoryOpen(true)}
            aria-label="Recent chats"
          >
            <ClockCounterClockwise size={20} />
          </button>
          <div className="w-9 h-9 rounded-full bg-forest-600 text-white flex items-center justify-center shrink-0">
            <Sparkle size={18} weight="fill" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold leading-tight">Adam AI</p>
            <p className="text-xs text-stone-500 leading-tight truncate">
              Your in-house offsider — social, marketing, listings, customers
            </p>
          </div>
        </div>

        {!configured && (
          <div className="flex items-start gap-2.5 px-5 py-3 bg-amber-50 border-b border-amber-200 text-sm text-amber-900">
            <Warning size={18} weight="fill" className="shrink-0 mt-0.5" />
            <p>
              Adam AI isn&apos;t switched on yet. Add an <code className="font-mono">ANTHROPIC_API_KEY</code>{" "}
              secret in the Cloudflare dashboard and it&apos;ll come to life.
            </p>
          </div>
        )}

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
