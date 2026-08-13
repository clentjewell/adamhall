"use client";

import { HandWaving } from "@phosphor-icons/react";
import { ENQUIRE_INTENT_EVENT } from "@/components/EnquiryForm";

/**
 * The high-intent CTA on a car page: "I'm interested".
 *
 * Deliberately not a new form. The enquiry card further down the page already
 * asks everything this needs and already routes to Adam's inbox, so this
 * scrolls the buyer to it and flips it to "Book a look" — the existing path
 * that already means genuine buying interest rather than a question.
 *
 * It is a real anchor first: with JavaScript off it still lands on the form,
 * just without the mode change. The event is the enhancement, not the
 * mechanism.
 *
 * Visually distinct from Save on purpose. Save is a bookmark and renders as a
 * quiet secondary button; this is the action Adam actually wants and takes the
 * page's one sand-coloured CTA.
 */
export default function InterestedButton({ className }: { className?: string }) {
  return (
    <a
      href="#enquire"
      onClick={() => window.dispatchEvent(new CustomEvent(ENQUIRE_INTENT_EVENT))}
      className={className ?? "btn-cta w-full"}
    >
      <HandWaving size={18} weight="bold" />
      I&apos;m interested
    </a>
  );
}
