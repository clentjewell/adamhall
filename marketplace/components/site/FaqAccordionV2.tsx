"use client";

import { useState } from "react";

/**
 * FAQ accordion for the redesigned page (artifact frame 1j).
 *
 * Single-open, first item open on arrival, hairline between rows and a
 * −/+ marker rather than a chevron — the artifact's reading. The questions
 * themselves come from the CMS (content.faq.items) and keep their data-edit
 * hooks, so the admin's copy editor still drives this page.
 */
export default function FaqAccordionV2({
  items,
}: {
  items: { q: string; a: string; idx: number }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mp2-faq__list">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q + i} className={`mp2-faq__item${isOpen ? " is-open" : ""}`}>
            <h3 className="mp2-faq__q">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`mp2-faq-panel-${i}`}
                id={`mp2-faq-btn-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span data-edit={`faq.items.${item.idx}.q`}>{item.q}</span>
                <span className="mp2-faq__marker" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              className="mp2-faq__panel"
              id={`mp2-faq-panel-${i}`}
              role="region"
              aria-labelledby={`mp2-faq-btn-${i}`}
              hidden={!isOpen}
            >
              <p data-edit={`faq.items.${item.idx}.a`}>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
