"use client";

import { useState } from "react";
import { submitContactMessage } from "@/app/actions/public";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Contact form — fields match the reference: Your Name*, Your Email*, Message.
    Submits to the marketplace's general-enquiry server action (submitContactMessage). */
export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "This field is required";
    if (!values.email.trim()) errs.email = "This field is required";
    else if (!emailRe.test(values.email))
      errs.email = "Please enter a valid email address";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus("submitting");
    try {
      const res = await submitContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim() || undefined,
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="vform vform--done" role="status" aria-live="polite">
        <div className="vform__check" aria-hidden="true">
          ✓
        </div>
        <h3>Message sent!</h3>
        <p>
          Thanks for getting in touch — Adam will get back to you asap. For
          anything urgent, call{" "}
          <a href="tel:0404290617">0404&nbsp;290&nbsp;617</a>.
        </p>
      </div>
    );
  }

  return (
    <form className="vform" onSubmit={onSubmit} noValidate aria-label="Contact Adam">
      {status === "error" && (
        <p className="vform__alert" role="alert">
          Sorry, something went wrong sending your message. Please call Adam on{" "}
          <a href="tel:0404290617">0404 290 617</a>.
        </p>
      )}
      <div className={`vform__field ${errors.name ? "has-error" : ""}`}>
        <label htmlFor="cf-name">
          Your Name
          <span className="vform__req" aria-hidden="true">
            {" "}
            *
          </span>
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          placeholder="E.g. John Smith"
          autoComplete="name"
          required
          value={values.name}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "cf-name-err" : undefined}
          onChange={(e) => set("name", e.target.value)}
        />
        {errors.name && (
          <span className="vform__error" id="cf-name-err">
            {errors.name}
          </span>
        )}
      </div>
      <div className={`vform__field ${errors.email ? "has-error" : ""}`}>
        <label htmlFor="cf-email">
          Your Email
          <span className="vform__req" aria-hidden="true">
            {" "}
            *
          </span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          placeholder="E.g. john@smith.com"
          autoComplete="email"
          required
          value={values.email}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "cf-email-err" : undefined}
          onChange={(e) => set("email", e.target.value)}
        />
        {errors.email && (
          <span className="vform__error" id="cf-email-err">
            {errors.email}
          </span>
        )}
      </div>
      <div className="vform__field">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          placeholder="Enter your message..."
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </div>
      <button
        className="vform__submit"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
