"use client";

import { Check } from "@phosphor-icons/react";

/**
 * The three steps of getting a range, with the one you are on marked.
 *
 * Step one is genuinely complete by the time this renders: every route to
 * this page is a choice between the instant range and calling us, and the
 * visitor took the first. That is what the tick claims and no more. A
 * stepper that opened on step two while step one had not happened would be
 * telling the visitor they had done something they had not.
 *
 * Step three lights up when a range actually exists, so the marker tracks
 * the real state of the tool rather than decorating it.
 */
const STEPS = [
  { n: 1, label: "Instant range", hint: "Chosen" },
  { n: 2, label: "Your car", hint: "Tell us about it" },
  { n: 3, label: "Your range", hint: "Straight away" },
] as const;

export default function ValuationSteps({ current }: { current: 2 | 3 }) {
  return (
    <ol className="vsteps" aria-label="Getting your range">
      {STEPS.map((s) => {
        const done = s.n < current;
        const now = s.n === current;
        return (
          <li
            key={s.n}
            className={`vsteps__step${done ? " is-done" : ""}${now ? " is-now" : ""}`}
            aria-current={now ? "step" : undefined}
          >
            <span className="vsteps__marker" aria-hidden="true">
              {done ? <Check size={15} weight="bold" /> : s.n}
            </span>
            <span className="vsteps__text">
              <span className="vsteps__label">{s.label}</span>
              <span className="vsteps__hint">{s.hint}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
