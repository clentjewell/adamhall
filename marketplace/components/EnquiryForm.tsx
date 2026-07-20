"use client";

import { useActionState, useState } from "react";
import { submitEnquiry, type ActionState } from "@/app/actions/public";
import { ChatCircleText, CalendarCheck } from "@phosphor-icons/react";

const initial: ActionState = { ok: false };

export default function EnquiryForm({ carId, carName }: { carId: string; carName: string }) {
  const [kind, setKind] = useState<"enquiry" | "book_look">("enquiry");
  const [state, action, pending] = useActionState(submitEnquiry, initial);

  if (state.ok) {
    return (
      <div className="card p-6 text-center" role="status">
        <p className="font-display font-bold text-lg text-forest-700">
          Got it. We&apos;ll call you back shortly.
        </p>
        <p className="text-stone-600 mt-1 text-sm">
          Usually within a couple of hours during the day. If it&apos;s urgent,
          the phone number at the top goes straight to us.
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
          <input id="enq-name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="enq-phone" className="label">Phone</label>
          <input id="enq-phone" name="phone" type="tel" required className="input" autoComplete="tel" />
          <p className="helper">We call rather than email tennis. Quicker for everyone.</p>
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
      </div>

      {state.error && <p className="error-text">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full mt-5">
        {pending
          ? "Sending…"
          : kind === "book_look"
            ? "Request a time"
            : "Send enquiry"}
      </button>
    </form>
  );
}
