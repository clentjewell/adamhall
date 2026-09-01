"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifier, emailTemplates } from "@/lib/notify";
import { site } from "@/lib/site-data/site";

export interface ActionState {
  ok: boolean;
  error?: string;
}

const enquirySchema = z.object({
  car_id: z.string().uuid(),
  kind: z.enum(["enquiry", "book_look"]),
  name: z.string().trim().min(2, "Tell us your name"),
  phone: z.string().trim().min(8, "We need a phone number to call you back"),
  email: z.string().trim().email("That email doesn't look right").optional().or(z.literal("")),
  preferred_time: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
  // Informational: it tells Adam how to answer, it does not branch anything.
  // Defaulted rather than required so an older cached form still submits.
  preferred_contact_method: z.enum(["call", "text", "email"]).default("call"),
  financing_interest: z.boolean(),
  trade_in_interest: z.boolean(),
});

export async function submitEnquiry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = enquirySchema.safeParse({
    car_id: formData.get("car_id"),
    kind: formData.get("kind"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    preferred_time: formData.get("preferred_time") || undefined,
    message: formData.get("message") || undefined,
    preferred_contact_method: formData.get("preferred_contact_method") || undefined,
    // An unticked checkbox sends nothing at all, so absence is the false case.
    financing_interest: formData.get("financing_interest") === "on",
    trade_in_interest: formData.get("trade_in_interest") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Attribute the enquiry to the sender's account if they happen to be signed
  // in. Read from the session, never from the form: the client does not get
  // to say whose enquiry this is. Null is the ordinary case — most people who
  // ask about a car have no account, and enquiring never requires one.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("enquiries").insert({
    ...parsed.data,
    email: parsed.data.email || null,
    preferred_time: parsed.data.preferred_time ?? null,
    message: parsed.data.message ?? null,
    user_id: user?.id ?? null,
  });
  if (error) {
    console.error("submitEnquiry:", error.message);
    return { ok: false, error: "Something went wrong on our end. Please call us instead." };
  }

  // One lookup now feeds both emails. It used to sit inside the admin-email
  // branch; the buyer's confirmation needs the slug for a link back.
  const { data: car } = await supabase
    .from("cars")
    .select("slug, make, model, year, badge")
    .eq("id", parsed.data.car_id)
    .maybeSingle();
  const carName = car ? `${car.year} ${car.make} ${car.model}` : "a listed car";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const carUrl = car ? `${baseUrl}/cars/${car.slug}` : undefined;
  const wantsLook = parsed.data.kind === "book_look";

  // Neither email is allowed to fail the enquiry: the row is already saved and
  // the buyer has been told we have it. A dead mail provider must not surface
  // as "something went wrong" after a successful submit.
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    const t = emailTemplates.enquiryReceived({
      adminEmail,
      carName,
      carUrl,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      wantsLook,
      preferredContactMethod: parsed.data.preferred_contact_method,
      preferredTime: parsed.data.preferred_time,
      financingInterest: parsed.data.financing_interest,
      tradeInInterest: parsed.data.trade_in_interest,
    });
    try {
      await notifier.sendEmail({ to: t.to, subject: t.subject, html: t.html });
    } catch (err) {
      console.error("submitEnquiry: admin notify failed:", err);
    }
  }

  // The buyer's receipt, only where they gave us somewhere to send it. The
  // on-screen confirmation is what everyone gets; this is in addition to it.
  if (parsed.data.email) {
    const t = emailTemplates.enquiryConfirmation({
      name: parsed.data.name,
      carName,
      carUrl,
      phoneDisplay: site.phoneDisplay,
      financeUrl: parsed.data.financing_interest ? `${baseUrl}/finance` : undefined,
    });
    try {
      await notifier.sendEmail({
        to: parsed.data.email,
        subject: t.subject,
        html: t.html,
      });
    } catch (err) {
      console.error("submitEnquiry: buyer confirmation failed:", err);
    }
  }

  return { ok: true };
}

// General website contact enquiry (the ported /contact-us page). The existing
// submitEnquiry is car-specific (requires a car_id + phone), so a general
// name/email/message enquiry gets its own action. It routes to Adam via the
// shared notifier (which logs in dev when RESEND_API_KEY is unset).
const contactSchema = z.object({
  name: z.string().trim().min(2, "This field is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  message: z.string().trim().max(4000).optional(),
});

export async function submitContactMessage(input: {
  name: string;
  email: string;
  message?: string;
}): Promise<ActionState> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const { name, email, message } = parsed.data;
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  try {
    await notifier.sendEmail({
      to: adminEmail || email,
      subject: `New website enquiry from ${name}`,
      html: `<p><strong>${escape(name)}</strong> (${escape(email)}) sent a message via the contact page:</p><p>${escape(message || "(no message)")}</p>`,
    });
  } catch (err) {
    console.error("submitContactMessage:", err);
    return { ok: false, error: "Something went wrong sending your message." };
  }
  return { ok: true };
}

const watchlistSchema = z.object({
  email: z.string().trim().email("That email doesn't look right"),
  make: z.string().trim().min(2, "Which make are you after?"),
  model: z.string().trim().max(60).optional(),
  max_price: z.coerce.number().positive().max(500000).optional(),
});

export async function joinWatchlist(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = watchlistSchema.safeParse({
    email: formData.get("email"),
    make: formData.get("make"),
    model: formData.get("model") || undefined,
    max_price: formData.get("max_price") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("watchlist_alerts").insert({
    email: parsed.data.email,
    make: parsed.data.make,
    model: parsed.data.model ?? null,
    max_price: parsed.data.max_price ?? null,
  });
  if (error) {
    console.error("joinWatchlist:", error.message);
    return { ok: false, error: "Couldn't save that alert. Please try again." };
  }
  return { ok: true };
}
