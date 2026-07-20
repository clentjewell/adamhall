"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifier, emailTemplates } from "@/lib/notify";

export interface ActionState {
  ok: boolean;
  error?: string;
}

const enquirySchema = z.object({
  car_id: z.string().uuid(),
  kind: z.enum(["enquiry", "book_look"]),
  name: z.string().trim().min(2, "Tell us your name"),
  phone: z.string().trim().min(8, "We need a phone number to call you back"),
  preferred_time: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
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
    preferred_time: formData.get("preferred_time") || undefined,
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert({
    ...parsed.data,
    preferred_time: parsed.data.preferred_time ?? null,
    message: parsed.data.message ?? null,
  });
  if (error) {
    console.error("submitEnquiry:", error.message);
    return { ok: false, error: "Something went wrong on our end. Please call us instead." };
  }

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    const { data: car } = await supabase
      .from("cars")
      .select("make, model, year, badge")
      .eq("id", parsed.data.car_id)
      .maybeSingle();
    const carName = car
      ? `${car.year} ${car.make} ${car.model}`
      : "a listed car";
    const t = emailTemplates.enquiryReceived(
      adminEmail,
      carName,
      parsed.data.name,
      parsed.data.phone,
    );
    await notifier.sendEmail({ to: t.to, subject: t.subject, html: t.html });
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
