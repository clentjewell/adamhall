"use client";

import { useEffect } from "react";

/**
 * Adds `is-visible` to every `.reveal` element when it scrolls into view,
 * reproducing the reference site's fade-in-up animations. Ported from the
 * Vite site's src/hooks/useReveal.ts (now a client hook for Next.js).
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    document.documentElement.classList.add("js");
    const els = Array.from(
      document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-zoom",
      ),
    );
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
