"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// Motion tokens from the Car Marketplace Brand Identity, section 13
// ("Quick, quiet, and over"). Durations: instant 120ms for hover and
// focus, standard 200ms as the default, entrance 320ms for panels and
// results, gallery 400ms — the longest permitted anywhere. Nothing
// bounces, nothing springs, nothing overshoots.
export const DUR = {
  instant: 0.12,
  standard: 0.2,
  entrance: 0.32,
  gallery: 0.4,
} as const;

export const EASE_STANDARD = [0.2, 0, 0.2, 1] as const;
export const EASE_ENTRANCE = [0, 0, 0.2, 1] as const;
export const EASE_EXIT = [0.4, 0, 1, 1] as const;

/** Back-compat alias: the identity's standard curve. */
export const EASE = EASE_STANDARD;

// The identity rules out scroll-triggered animation entirely ("anything
// on scroll: never — no parallax, no fade-up-on-scroll, no counters
// triggering in the viewport"), so Reveal and CardReveal render their
// children statically. They keep their props so call sites stay stable.
export function Reveal({
  children,
  delay: _delay = 0,
  y: _y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

// Page-load hero entrance: the whole block arrives together in one
// 320ms entrance. Load is an event worth confirming; per-item stagger
// is not ("results cross-fade, they do not stagger in one by one").
export function HeroStagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.entrance, ease: EASE_ENTRANCE }}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardReveal({
  children,
  index: _index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
