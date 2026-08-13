"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Car } from "@/lib/types";
import CarCard from "@/components/CarCard";

/**
 * The home page's stock preview.
 *
 * It used to show the three newest cars and stop. Every car on the
 * Marketplace is now here, on a rail the visitor drags or steps through, so
 * the page opens on the actual size of the stock rather than a sample of it.
 *
 * Native scroll with CSS snap points does the work: no scroll-triggered
 * animation (which the identity rules out), no library, and it keeps
 * trackpad, touch, keyboard and scrollbar behaviour for free. The arrows are
 * a convenience over the top, and they hide themselves when there is nothing
 * further to reach in that direction.
 */
export default function StockRail({ cars }: { cars: Car[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Track the ends so an arrow that would do nothing is not offered.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      setAtStart(el.scrollLeft < 8);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
    };
    read();
    el.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      el.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  const step = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide]");
    // One card plus its gap, so a press always lands on a snap point.
    const distance = card ? card.offsetWidth + 32 : el.clientWidth * 0.8;
    el.scrollBy({
      left: direction * distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

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
          <div key={car.id} data-slide className="mp-rail__slide">
            {/* The first three are above the fold on a wide screen. */}
            <CarCard car={car} priority={i < 3} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => step(-1)}
        className="mp-rail__arrow mp-rail__arrow--prev"
        aria-label="Show previous cars"
        hidden={atStart}
      >
        <CaretLeft size={20} weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        className="mp-rail__arrow mp-rail__arrow--next"
        aria-label="Show more cars"
        hidden={atEnd}
      >
        <CaretRight size={20} weight="bold" />
      </button>
    </div>
  );
}
