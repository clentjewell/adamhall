"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifier, emailTemplates } from "@/lib/notify";

const sellSchema = z.object({
  rego: z.string().trim().max(10).optional(),
  rego_state: z.string().trim().max(3).optional(),
  make: z.string().trim().max(40).optional(),
  model: z.string().trim().max(60).optional(),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  odometer_km: z.coerce.number().int().min(0).max(1_000_000),
  service_history: z.enum(["full", "partial", "none", "unknown"]),
  had_accidents: z.boolean(),
  accident_notes: z.string().trim().max(1000).optional(),
  tyres_condition: z.string().trim().max(200).optional(),
  interior_condition: z.string().trim().max(500).optional(),
  mechanical_issues: z.string().trim().max(1000).optional(),
  condition_notes: z.string().trim().max(2000).optional(),
  seller_name: z.string().trim().min(2, "We need a name to address you by"),
  phone: z.string().trim().min(8, "We need a number to reach you on"),
  email: z.string().trim().email("That email doesn't look right"),
  suburb: z.string().trim().max(80).optional(),
  asking_price: z.coerce.number().positive().max(1_000_000).optional(),
  sell_timeframe: z.string().trim().max(60).optional(),
  trade_target_car_id: z.string().uuid().optional(),
  photo_paths: z
    .array(z.object({ path: z.string().max(300), kind: z.string().max(40).optional() }))
    .max(12),
});

export type SellPayload = z.input<typeof sellSchema>;

export interface SellResult {
  ok: boolean;
  token?: string;
  error?: string;
}

export async function createSubmission(payload: SellPayload): Promise<SellResult> {
  const parsed = sellSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;
  if (!d.rego && !(d.make && d.model && d.year)) {
    return {
      ok: false,
      error: "Give us either your rego or the make, model and year.",
    };
  }

  // Anon RLS allows inserting but never reading back, so RETURNING is
  // unavailable — generate id + token here instead of relying on defaults.
  const id = randomUUID();
  const token = randomBytes(16).toString("hex");

  const supabase = await createClient();
  const { error } = await supabase
    .from("submissions")
    .insert({
      id,
      token,
      rego: d.rego ?? null,
      rego_state: d.rego_state ?? null,
      make: d.make ?? null,
      model: d.model ?? null,
      year: d.year ?? null,
      odometer_km: d.odometer_km,
      service_history: d.service_history,
      had_accidents: d.had_accidents,
      accident_notes: d.accident_notes ?? null,
      tyres_condition: d.tyres_condition ?? null,
      interior_condition: d.interior_condition ?? null,
      mechanical_issues: d.mechanical_issues ?? null,
      condition_notes: d.condition_notes ?? null,
      seller_name: d.seller_name,
      phone: d.phone,
      email: d.email,
      suburb: d.suburb ?? null,
      asking_price: d.asking_price ?? null,
      sell_timeframe: d.sell_timeframe ?? null,
      trade_target_car_id: d.trade_target_car_id ?? null,
    });

  if (error) {
    console.error("createSubmission:", error.message);
    return {
      ok: false,
      error: "Something went wrong saving your car. Please try again or just call us.",
    };
  }

  if (d.photo_paths.length > 0) {
    const { error: photoError } = await supabase.from("submission_photos").insert(
      d.photo_paths.map((p) => ({
        submission_id: id,
        path: p.path,
        kind: p.kind ?? null,
      })),
    );
    if (photoError) console.error("createSubmission photos:", photoError.message);
  }

  const statusUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/sell/status/${token}`;
  const t = emailTemplates.submissionReceived(d.seller_name, statusUrl);
  await notifier.sendEmail({ to: d.email, subject: t.subject, html: t.html });

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    await notifier.sendEmail({
      to: adminEmail,
      subject: `New car submitted: ${[d.year, d.make, d.model].filter(Boolean).join(" ") || d.rego}`,
      html: `<p>${d.seller_name} (${d.phone}, ${d.suburb ?? "suburb not given"}) submitted a car. It's in the queue.</p>`,
    });
  }

  return { ok: true, token };
}
