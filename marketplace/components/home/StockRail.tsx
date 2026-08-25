"use client";

import { useEffect, useRef } from "react";
import type { Car } from "@/lib/types";
import CarCard from "@/components/CarCard";

/**
 * The home page's stock rail: every car on the Marketplace, drifting slowly
 * right to left.
 *
 * The list is rendered twice and the track resets to the halfway mark the
 * moment it passes it, so the loop never shows a seam or a jump back. The
 * second copy is inert: aria-hidden, not focusable, and rendered with
 * `duplicate` so it does not claim the view-transition names the real cards
 * use to morph into the car page.
 *
 * Motion rules, since the identity is strict about this. The drift is
 * ambient rather than a transition, it is slow enough to read a card while
 * it moves, and it stops the moment anyone shows intent: pointer over the
 * rail, keyboard focus inside it, the tab hidden, or the visitor scrolling
 * it themselves. Under prefers-reduced-motion it never starts, and the rail
 * stays a plain scroller.
 */
const PIXELS_PER_SECOND = 26;

export default function StockRail({ cars }: { cars: Car[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = performance.now();
    // Sub-pixel travel is accumulated here: scrollLeft rounds, so adding
    // less than a pixel per frame directly would never move at all.
    let offset = el.scrollLeft;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      if (!paused.current && !document.hidden) {
        offset += PIXELS_PER_SECOND * dt;
        // The first copy ends at the halfway point; wrapping there puts an
        // identical card in the identical place, so the seam is invisible.
        const half = el.scrollWidth / 2;
        if (offset >= half) offset -= half;
        el.scrollLeft = offset;
      } else {
        // Stay in step with wherever the visitor has scrolled to.
        offset = el.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const hold = () => (paused.current = true);
    const release = () => (paused.current = false);
    el.addEventListener("pointerenter", hold);
    el.addEventListener("pointerleave", release);
    el.addEventListener("focusin", hold);
    el.addEventListener("focusout", release);
    // A visitor flicking the rail themselves should not fight the drift.
    el.addEventListener("pointerdown", hold);
    window.addEventListener("pointerup", release);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", hold);
      el.removeEventListener("pointerleave", release);
      el.removeEventListener("focusin", hold);
      el.removeEventListener("focusout", release);
      el.removeEventListener("pointerdown", hold);
      window.removeEventListener("pointerup", release);
    };
  }, []);

  return (
    <div className="mp-rail">
      <div
        ref={ref}
        className="mp-rail__track"
        tabIndex={0}
        role="region"
        aria-label="Cars on the Marketplace"
      >
        {cars.map((car, i) => (
          <div key={car.id} className="mp-rail__slide">
            <CarCard car={car} priority={i < 3} />
          </div>
        ))}
        {/* The loop's second half. Inert in every sense. */}
        {cars.map((car) => (
          <div
            key={`loop-${car.id}`}
            className="mp-rail__slide"
            aria-hidden="true"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            inert={"" as unknown as boolean}
          >
            <CarCard car={car} duplicate />
          </div>
        ))}
      </div>
    </div>
  );
}
