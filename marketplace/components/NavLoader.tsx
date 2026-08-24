"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { brand } from "@/lib/brand";

/**
 * The between-pages screen: the mark on green while a navigation is in flight.
 *
 * It deliberately does NOT appear on every click. Following a link is the most
 * frequent thing anyone does on this site, and a screen thrown up on each one
 * would add a wait where there wasn't one — most navigations here resolve in
 * well under the time it takes to read a logo, so the screen would be a flash
 * of green and nothing else. It waits DELAY_MS first, and if the route has
 * already changed by then it never shows at all. What the reader sees is the
 * fast case staying instant and only a genuinely slow page getting a screen.
 *
 * The thin bar at the top of the viewport (TopLoader) still covers the fast
 * case, which is why that is a bar and this is a screen: one says "something
 * is happening", the other says "this is taking a moment". TopLoader sits
 * above this in the stack so it stays visible over the green.
 *
 * The mark is the only thing on it, at Adam's direction. The sand rule beneath
 * moves twice and never loops: out to most of the way when the screen opens,
 * then to full when the page arrives. A looping pulse would be an attention
 * device on a screen nobody chose to look at, and this is the one piece of
 * motion on the site whose whole job is to say "not yet".
 *
 * Reduced motion gets the same screen with nothing eased: it appears, the rule
 * is simply full, and it goes.
 */

/** How long a navigation has to be in flight before the screen is worth it.
    Under this, the reader never sees it — which on this site is most clicks. */
const DELAY_MS = 400;
/** Must match .nav-screen.is-leaving's transition in globals.css: the element
    is unmounted after it, so a shorter value here would cut the fade off. */
const FADE_OUT_MS = 180;
/** How far the rule runs while waiting. Mirrors --nav-rule-wait, which the
    stylesheet documents; kept as a number here because it is a transform
    value the component sets directly. */
const WAIT = 0.72;
/** If a navigation never resolves — a route that throws, a dropped
    connection — the screen comes down rather than trapping the reader
    behind it. */
const SAFETY_MS = 10000;

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function NavLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  /** 0 until the screen has painted, then the waiting value, then full. */
  const [rule, setRule] = useState(0);

  /** Mirrors `shown` for the listeners, which must not re-subscribe on it. */
  const shownRef = useRef(false);
  const reduceRef = useRef(false);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    for (const ref of [delayRef, safetyRef, outRef]) {
      if (ref.current) clearTimeout(ref.current);
      ref.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearTimers();
    if (!shownRef.current) return;
    shownRef.current = false;
    // The rule finishing is what says the page is here; the screen fades over
    // the top of it.
    setRule(1);
    setLeaving(true);
    outRef.current = setTimeout(
      () => {
        setShown(false);
        setLeaving(false);
        setRule(0);
      },
      reduceRef.current ? 0 : FADE_OUT_MS,
    );
  }, [clearTimers]);

  const open = useCallback(() => {
    shownRef.current = true;
    setShown(true);
    setLeaving(false);
    setRule(0);
    safetyRef.current = setTimeout(hide, SAFETY_MS);
  }, [hide]);

  // Move the rule off zero once the screen is mounted. An effect rather than a
  // requestAnimationFrame: rAF is a frame callback, and the frames are exactly
  // what is not guaranteed here — the first attempt used two of them and the
  // rule never moved at all. Effects are ordered by React against the commit,
  // not against the compositor.
  useEffect(() => {
    if (!shown || leaving) return;
    setRule(WAIT);
  }, [shown, leaving]);

  const arm = useCallback(() => {
    if (shownRef.current || delayRef.current) return;
    delayRef.current = setTimeout(() => {
      delayRef.current = null;
      open();
    }, DELAY_MS);
  }, [open]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceRef.current = mql.matches;
    const onChange = () => {
      reduceRef.current = mql.matches;
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Same contract as TopLoader: same-origin, plain left-click, a path that is
  // actually different. Captured on the document rather than wired per link,
  // because every internal link on the site would otherwise have to opt in.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return;
      if (event.defaultPrevented) return;

      const anchor = (event.target as HTMLElement | null)?.closest(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const raw = anchor.getAttribute("href");
      if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      // A link to the same page, or to an anchor within it, is not a
      // navigation worth covering the screen for.
      if (
        url.pathname + url.search ===
        window.location.pathname + window.location.search
      )
        return;

      arm();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [arm]);

  // Anything that means the navigation is no longer in flight takes the screen
  // down: the route resolved, the reader went back, or the document is being
  // torn down for a full page load.
  useEffect(() => {
    const onPageHide = () => hide();
    const onPopState = () => hide();
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("popstate", onPopState);
    };
  }, [hide]);

  // The route changed, so the page the reader asked for is here. This also
  // cancels a screen that was armed but had not opened yet, which is the
  // ordinary case on a fast navigation.
  useEffect(() => {
    clearTimers();
    if (shownRef.current) hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => clearTimers, [clearTimers]);

  if (!shown) return null;

  return (
    <div
      // Not a live region and not focus-trapping: it is a cover over a
      // navigation the reader already started, and it is gone by the time
      // anything underneath it could be reached. A screen reader gets the new
      // page announced by the route change itself, which is the useful event.
      aria-hidden="true"
      className={`nav-screen fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-forest-600${
        leaving ? " is-leaving" : ""
      }`}
    >
      {/* The mark as supplied, white cut, on green — the one pairing the
          identity allows for it. Width is capped against the viewport so it
          never touches the edges on a phone. */}
      {brand.logo.kind === "image" ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={brand.logo.srcReverse}
          alt=""
          width={brand.logo.width}
          height={brand.logo.height}
          className="h-auto w-[min(19rem,62vw)]"
        />
      ) : null}

      {/* The rule. Scaled rather than widened, so it never lays out, and driven
          by the nav-rule animation in globals.css rather than from state —
          see the note there. */}
      <span className="block h-[2px] w-[min(13rem,42vw)] overflow-hidden rounded-full bg-white/20">
        <span
          className={`nav-rule block h-full w-full rounded-full bg-sand${
            leaving ? " is-done" : ""
          }`}
          style={{ transform: `scaleX(${rule})` }}
        />
      </span>
    </div>
  );
}

export default function NavLoader() {
  // useSearchParams needs a Suspense boundary to keep the rest of the tree
  // statically renderable, exactly as TopLoader does.
  return (
    <Suspense fallback={null}>
      <NavLoaderInner />
    </Suspense>
  );
}
