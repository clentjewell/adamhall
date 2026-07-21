"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  DeviceMobile,
  Desktop,
} from "@phosphor-icons/react";
import { saveSiteContent } from "@/app/actions/content";
import type { SiteContent } from "@/lib/content";
import ContentEditor from "@/components/admin/ContentEditor";

// The site itself is the editor: the iframe loads the real pages in edit
// mode (EditModeBridge makes text editable and posts changes up), this
// shell collects the edits and publishes them through saveSiteContent.

const PAGES = [
  { label: "Home", path: "/" },
  { label: "Cars", path: "/cars" },
  { label: "Sell", path: "/sell" },
  { label: "Finance", path: "/finance" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
];

function applyPath(obj: unknown, path: string, value: string) {
  const parts = path.split(".");
  let node = obj as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const next = Array.isArray(node)
      ? (node as unknown[])[Number(key)]
      : node[key];
    if (next == null || typeof next !== "object") return;
    node = next as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(node)) (node as unknown[])[Number(last)] = value;
  else node[last] = value;
}

export default function LiveEditor({ initial }: { initial: SiteContent }) {
  const [base, setBase] = useState<SiteContent>(initial);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [currentPath, setCurrentPath] = useState("/");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editsRef = useRef(edits);
  editsRef.current = edits;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data as { type?: string; path?: string; value?: string };
      if (data?.type === "ah-edit" && data.path != null && data.value != null) {
        setStatus(null);
        setEdits((prev) => ({ ...prev, [data.path!]: data.value! }));
      } else if (data?.type === "ah-ready" && data.path) {
        setCurrentPath(data.path);
        iframeRef.current?.contentWindow?.postMessage(
          { type: "ah-apply", edits: editsRef.current },
          window.location.origin,
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (iframeRef.current) iframeRef.current.src = `${path}?edit=1`;
  };

  const reloadFrame = useCallback(() => {
    iframeRef.current?.contentWindow?.location.reload();
  }, []);

  const unsaved = Object.keys(edits).length;

  const save = async () => {
    setPending(true);
    setStatus(null);
    const next = structuredClone(base) as SiteContent;
    for (const [path, value] of Object.entries(edits)) {
      applyPath(next, path, value.trim());
    }
    const r = await saveSiteContent(next);
    setPending(false);
    if (r.ok) {
      setBase(next);
      setEdits({});
      setStatus({ ok: true, msg: "Published. The live site updates within seconds." });
      reloadFrame();
    } else {
      setStatus({ ok: false, msg: r.error ?? "Couldn't save." });
    }
  };

  const discard = () => {
    setEdits({});
    setStatus(null);
    reloadFrame();
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-stone-200 -mx-1 px-1 py-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {PAGES.map((p) => (
            <button
              key={p.path}
              onClick={() => navigate(p.path)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${
                currentPath === p.path
                  ? "bg-forest-600 text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:border-forest-200"
              }`}
            >
              {p.label}
            </button>
          ))}
          <span className="mx-1 h-6 w-px bg-stone-200 hidden sm:block" />
          <button
            onClick={() => setDevice("desktop")}
            aria-label="Desktop width"
            className={`p-2 rounded-lg ${device === "desktop" ? "bg-forest-50 text-forest-700" : "text-stone-500 hover:bg-stone-100"}`}
          >
            <Desktop size={18} weight="bold" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            aria-label="Mobile width"
            className={`p-2 rounded-lg ${device === "mobile" ? "bg-forest-50 text-forest-700" : "text-stone-500 hover:bg-stone-100"}`}
          >
            <DeviceMobile size={18} weight="bold" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            {unsaved > 0 && (
              <span className="text-xs font-bold text-amber-accent bg-amber-soft px-2.5 py-1 rounded-full">
                {unsaved} unsaved change{unsaved === 1 ? "" : "s"}
              </span>
            )}
            {unsaved > 0 && (
              <button onClick={discard} className="btn-ghost !py-2 !px-3 text-sm !text-stone-500">
                <ArrowCounterClockwise size={14} weight="bold" />
                Discard
              </button>
            )}
            <button
              onClick={save}
              disabled={pending || unsaved === 0}
              className="btn-primary !py-2 text-sm"
            >
              {pending ? "Publishing…" : "Save and publish"}
            </button>
          </div>
        </div>
        {status && (
          <p
            className={`mt-2 text-sm font-medium ${status.ok ? "text-forest-700" : "text-red-700"}`}
            role="status"
          >
            {status.msg}
          </p>
        )}
      </div>

      {/* The site, live */}
      <div
        className={`mx-auto transition-all duration-300 ${device === "mobile" ? "max-w-[400px]" : "max-w-none"}`}
      >
        <div className="rounded-2xl border border-stone-300 overflow-hidden bg-white shadow-sm">
          <iframe
            ref={iframeRef}
            src="/?edit=1"
            title="Site editor"
            className="w-full h-[72vh] block"
          />
        </div>
        <p className="text-xs text-stone-500 mt-2">
          Click any dashed text to edit it in place. Buttons and menus work
          like the real site — browse to the page you want to change.
        </p>
      </div>

      {/* Everything not editable inline */}
      <details className="mt-10">
        <summary className="cursor-pointer font-semibold text-stone-600 hover:text-forest-700">
          Advanced editor — numbers, add/remove FAQs &amp; sections, opening
          hours, legal pages, phone dial link
        </summary>
        <div className="mt-6">
          <ContentEditor initial={base} />
        </div>
      </details>
    </div>
  );
}
