"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { EASE } from "@/components/motion/Reveal";

// Shared easing, expressed as a CSS cubic-bezier string.
const EASE_CSS = `cubic-bezier(${EASE[0]}, ${EASE[1]}, ${EASE[2]}, ${EASE[3]})`;

const START_TARGET = 70; // where the initial burst lands
const CREEP_TARGET = 90; // ceiling the creep asymptotically approaches
const BURST_MS = 800; // duration of the 0 -> START_TARGET burst
const CREEP_INTERVAL_MS = 650; // cadence of creep steps
const FINISH_HOLD_MS = 150; // time the bar sits at 100% before fading
const FADE_MS = 200; // opacity fade-out duration
const SAFETY_TIMEOUT_MS = 8000; // hard stop if navigation never resolves
const REDUCED_START = 30; // reduced-motion: first (and only) step before finish

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function TopLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  const activeRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const burstTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
    if (creepTimeoutRef.current) clearTimeout(creepTimeoutRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    burstTimeoutRef.current = null;
    creepTimeoutRef.current = null;
    safetyTimeoutRef.current = null;
    holdTimeoutRef.current = null;
    fadeTimeoutRef.current = null;
  }, []);

  const scheduleCreep = useCallback(() => {
    creepTimeoutRef.current = setTimeout(() => {
      setDurationMs(CREEP_INTERVAL_MS);
      setProgress((p) => {
        const remaining = CREEP_TARGET - p;
        if (remaining <= 0.5) return p;
        const step = Math.max(remaining * 0.15, 0.4);
        return Math.min(p + step, CREEP_TARGET);
      });
      if (activeRef.current) scheduleCreep();
    }, CREEP_INTERVAL_MS);
  }, []);

  const finish = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearAllTimers();

    setFading(false);
    setDurationMs(reducedMotionRef.current ? 0 : 250);
    setProgress(100);

    holdTimeoutRef.current = setTimeout(() => {
      setFading(true);
      fadeTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setFading(false);
        setDurationMs(0);
        setProgress(0);
      }, FADE_MS);
    }, FINISH_HOLD_MS);
  }, [clearAllTimers]);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    clearAllTimers();

    setVisible(true);
    setFading(false);

    if (reducedMotionRef.current) {
      // Reduced motion: no creep, just a single step then a jump to 100%.
      setDurationMs(0);
      setProgress(REDUCED_START);
    } else {
      setDurationMs(BURST_MS);
      setProgress(START_TARGET);
      burstTimeoutRef.current = setTimeout(() => {
        scheduleCreep();
      }, BURST_MS);
    }

    safetyTimeoutRef.current = setTimeout(finish, SAFETY_TIMEOUT_MS);
  }, [clearAllTimers, finish, scheduleCreep]);

  // Track prefers-reduced-motion live.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mql.matches;
    const onChange = () => {
      reducedMotionRef.current = mql.matches;
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Click detection: same-origin, plain left-click link navigations only.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || !rawHref.startsWith("/") || rawHref.startsWith("//")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const nextPath = url.pathname + url.search;
      const currentPath = window.location.pathname + window.location.search;
      if (nextPath === currentPath) return;

      start();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [start]);

  // Safety net: finish immediately if the page is being torn down.
  useEffect(() => {
    const handlePageHide = () => finish();
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [finish]);

  // The route (or its query) actually changed — the navigation resolved.
  useEffect(() => {
    if (activeRef.current) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Clear any in-flight timers on unmount.
  useEffect(() => clearAllTimers, [clearAllTimers]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-[2.5px] bg-transparent"
      style={{
        opacity: visible ? (fading ? 0 : 1) : 0,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    >
      <div
        className="h-full"
        style={{
          width: "100%",
          transformOrigin: "left",
          transform: `scaleX(${progress / 100})`,
          transition: `transform ${durationMs}ms ${EASE_CSS}`,
          background:
            "linear-gradient(to right, var(--color-forest-500), var(--color-amber-accent))",
        }}
      />
    </div>
  );
}

export default function TopLoader() {
  return (
    <Suspense fallback={null}>
      <TopLoaderInner />
    </Suspense>
  );
}
