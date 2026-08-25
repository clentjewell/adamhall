"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitEnquiry, type ActionState } from "@/app/actions/public";
import { ChatCircleText, CalendarCheck } from "@phosphor-icons/react";
import { site } from "@/lib/site-data/site";

const initial: ActionState = { ok: false };

/**
 * Fired by the "I'm interested" button on the car page. The button and the
 * form are far apart in the layout (one is in the sticky buying rail, the
 * other is down the page), so they talk over a window event rather than being
 * lifted into a shared parent — the same idiom lib/garage.ts uses.
 */
export const ENQUIRE_INTENT_EVENT = "ah-enquire-intent";

export default function EnquiryForm({ carId, carName }: { carId: string; carName: string }) {
  const [kind, setKind] = useState<"enquiry" | "book_look">("enquiry");
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const nameRef = useRef<HTMLInputElement>(null);

  // "I'm interested" is the high-intent path, so it lands the buyer on the
  // book-a-look side of the toggle with the cursor already in the first field.
  useEffect(() => {
    const onIntent = () => {
      setKind("book_look");
      // After the anchor jump has settled, so focus doesn't fight the scroll.
      window.setTimeout(() => nameRef.current?.focus(), 300);
    };
    window.addEventListener(ENQUIRE_INTENT_EVENT, onIntent);
    return () => window.removeEventListener(ENQUIRE_INTENT_EVENT, onIntent);
  }, []);

  if (state.ok) {
    return (
      <div className="card p-6 text-center" role="status">
        <p className="type-panel-title text-forest-700">
          Got it. We will be in touch shortly.
        </p>
        <p className="text-stone-600 mt-1 text-sm">
          Usually within a couple of hours during the day. If it&apos;s urgent,
          call us direct on{" "}
          <a href={site.phoneHref} className="font-bold text-forest-700 whitespace-nowrap">
            {site.phoneDisplay}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card p-6" id="enquire">
      <input type="hidden" name="car_id" value={carId} />
      <input type="hidden" name="kind" value={kind} />

      <div className="grid grid-cols-2 gap-2 mb-5" role="tablist" aria-label="Enquiry type">
        <button
          type="button"
          role="tab"
          aria-selected={kind === "enquiry"}
          onClick={() => setKind("enquiry")}
          className={`btn text-sm py-2.5 px-3 ${kind === "enquiry" ? "bg-forest-600 text-white" : "border-2 border-stone-200 text-stone-600 hover:border-forest-200"}`}
        >
          <ChatCircleText size={16} weight="bold" />
          Ask a question
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={kind === "book_look"}
          onClick={() => setKind("book_look")}
          className={`btn text-sm py-2.5 px-3 ${kind === "book_look" ? "bg-forest-600 text-white" : "border-2 border-stone-200 text-stone-600 hover:border-forest-200"}`}
        >
          <CalendarCheck size={16} weight="bold" />
          Book a look
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="enq-name" className="label">Name</label>
          <input ref={nameRef} id="enq-name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="enq-phone" className="label">Phone</label>
          <input id="enq-phone" name="phone" type="tel" required className="input" autoComplete="tel" />
          <p className="helper">We call rather than email tennis. Quicker for everyone.</p>
        </div>
        <div>
          <label htmlFor="enq-email" className="label">
            Email <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <input id="enq-email" name="email" type="email" className="input" autoComplete="email" />
          <p className="helper">
            Worth adding, we&apos;ll send you a copy of this with our answers.
          </p>
        </div>
        <div>
          <label htmlFor="enq-contact-method" className="label">
            How would you rather we get back to you?
          </label>
          <select
            id="enq-contact-method"
            name="preferred_contact_method"
            className="input"
            defaultValue="call"
          >
            <option value="call">Give me a call</option>
            <option value="text">Send me a text</option>
            <option value="email">Email me</option>
          </select>
        </div>
        {kind === "book_look" && (
          <div>
            <label htmlFor="enq-time" className="label">When suits you?</label>
            <input
              id="enq-time"
              name="preferred_time"
              className="input"
              placeholder="Saturday morning, weekday after 4pm…"
            />
          </div>
        )}
        <div>
          <label htmlFor="enq-msg" className="label">
            Anything specific? <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <textarea
            id="enq-msg"
            name="message"
            rows={3}
            className="input resize-none"
            placeholder={`Questions about the ${carName}…`}
          />
        </div>
        {/* Two things worth knowing before Adam picks up the phone. Neither
            commits the buyer to anything, so they are checkboxes rather than
            another step. */}
        {/* The label is the tap target, so it carries a 44px minimum height
            rather than sitting at the checkbox's own 16px. */}
        <fieldset>
          <legend className="label">Anything else we should know?</legend>
          <label
            htmlFor="enq-finance"
            className="flex items-center gap-2.5 min-h-11 text-sm text-stone-600 cursor-pointer"
          >
            <input
              id="enq-finance"
              name="financing_interest"
              type="checkbox"
              className="size-4 shrink-0 accent-forest-600 cursor-pointer"
            />
            I&apos;d like to talk about finance
          </label>
          <label
            htmlFor="enq-trade"
            className="flex items-center gap-2.5 min-h-11 text-sm text-stone-600 cursor-pointer"
          >
            <input
              id="enq-trade"
              name="trade_in_interest"
              type="checkbox"
              className="size-4 shrink-0 accent-forest-600 cursor-pointer"
            />
            I have a car to trade in
          </label>
        </fieldset>
      </div>

      {state.error && <p className="error-text">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-cta w-full mt-5">
        {pending
          ? "Sending…"
          : kind === "book_look"
            ? "Request a time"
            : "Send enquiry"}
      </button>
    </form>
  );
}
