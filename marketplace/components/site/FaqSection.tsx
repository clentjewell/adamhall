"use client";

import { useState } from "react";
import { faqs } from "@/lib/site-data/faq";

/** "Questions & Answers" accordion. First item open by default, single-open behaviour. */
export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq section bg-cream" aria-labelledby="faq-title">
      <div className="container container--narrow">
        {/* h2, not h4: the questions below are h3, so an h4 here put the
            section heading a level *under* its own contents. */}
        <h2 id="faq-title" className="faq__title reveal">
          Questions &amp; Answers
        </h2>
        <div className="faq__list">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`faq__item ${isOpen ? "is-open" : ""}`} key={item.q}>
                <h3 className="faq__q">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-btn-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{item.q}</span>
                    <svg
                      className="faq__chevron"
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
                  className="faq__panel"
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  hidden={!isOpen}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
