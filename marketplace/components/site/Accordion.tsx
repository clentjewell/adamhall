"use client";

import { useState } from "react";

export interface AccordionItem {
  title: string;
  body: string;
}

/** Generic single-open accordion (used for the "How it works" steps). */
export default function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: AccordionItem[];
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="accordion">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            className={`accordion__item ${isOpen ? "is-open" : ""}`}
            key={item.title}
          >
            <h3 className="accordion__q">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`acc-panel-${i}`}
                id={`acc-btn-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.title}</span>
                <svg
                  className="accordion__chevron"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </h3>
            <div
              className="accordion__panel"
              id={`acc-panel-${i}`}
              role="region"
              aria-labelledby={`acc-btn-${i}`}
              hidden={!isOpen}
            >
              <p>{item.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
