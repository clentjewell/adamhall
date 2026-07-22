"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { notifier, emailTemplates } from "@/lib/notify";
import { carTitle, formatPrice, slugify } from "@/lib/format";
import {
  CHECKLIST_ITEMS,
  type ChecklistKey,
  type Submission,
  type SubmissionStatus,
} from "@/lib/types";

export interface AdminActionState {
  ok: boolean;
  error?: string;
}

// ── Auth ────────────────────────────────────────────────────────────

export async function signIn(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Email and password required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Wrong email or password." };
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ── Audit helper ────────────────────────────────────────────────────

async function logEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entityType: "submission" | "car" | "enquiry",
  entityId: string,
  fromStatus: string | null,
  toStatus: string,
  actor: string,
  note?: string,
) {
  const { error } = await supabase.from("status_events").insert({
    entity_type: entityType,
    entity_id: entityId,
    from_status: fromStatus,
    to_status: toStatus,
    actor,
    note: note ?? null,
  });
  if (error) console.error("logEvent:", error.message);
}

// ── Submission pipeline ─────────────────────────────────────────────

const statusSchema = z.enum(["new", "reviewing", "offer_made", "accepted", "declined", "settled"]);

export async function setSubmissionStatus(
  submissionId: string,
  next: SubmissionStatus,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = statusSchema.safeParse(next);
  if (!parsed.success) return { ok: false, error: "Bad status." };

  const { data: current } = await admin.supabase
    .from("submissions")
    .select("status")
    .eq("id", submissionId)
    .maybeSingle();
  if (!current) return { ok: false, error: "Submission not found." };

  const { error } = await admin.supabase
    .from("submissions")
    .update({ status: parsed.data })
    .eq("id", submissionId);
  if (error) return { ok: false, error: error.message };

  await logEvent(admin.supabase, "submission", submissionId, current.status, parsed.data, admin.name);

  // Accepting opens the settlement checklist; every high-control item
  // starts unticked and must be ticked deliberately.
  if (parsed.data === "accepted") {
    await admin.supabase
      .from("settlement_checklists")
      .upsert({ submission_id: submissionId }, { onConflict: "submission_id", ignoreDuplicates: true });
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ── Valuation worksheet ─────────────────────────────────────────────

const valuationSchema = z.object({
  submission_id: z.string().uuid(),
  offer_amount: z.coerce.number().positive().max(1_000_000).optional(),
  expected_retail: z.coerce.number().positive().max(1_000_000).optional(),
  expected_recon: z.coerce.number().min(0).max(200_000).optional(),
  notes: z.string().trim().max(4000).optional(),
});

export async function saveValuation(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = valuationSchema.safeParse({
    submission_id: formData.get("submission_id"),
    offer_amount: formData.get("offer_amount") || undefined,
    expected_retail: formData.get("expected_retail") || undefined,
    expected_recon: formData.get("expected_recon") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await admin.supabase.from("valuations").upsert(
    {
      submission_id: parsed.data.submission_id,
      offer_amount: parsed.data.offer_amount ?? null,
      expected_retail: parsed.data.expected_retail ?? null,
      expected_recon: parsed.data.expected_recon ?? null,
      notes: parsed.data.notes ?? null,
      updated_by: admin.name,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "submission_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/submissions/${parsed.data.submission_id}`);
  return { ok: true };
}

// ── Offer / decline ─────────────────────────────────────────────────

export async function sendOffer(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const submissionId = String(formData.get("submission_id") ?? "");
  const amount = Number(formData.get("offer_amount"));
  if (!submissionId || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Set the offer figure in the worksheet first." };
  }

  const { data: sub } = await admin.supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle<Submission>();
  if (!sub) return { ok: false, error: "Submission not found." };

  const { error } = await admin.supabase
    .from("submissions")
    .update({
      status: "offer_made",
      offer_amount: amount,
      offer_sent_at: new Date().toISOString(),
    })
    .eq("id", submissionId);
  if (error) return { ok: false, error: error.message };

  await logEvent(
    admin.supabase, "submission", submissionId, sub.status, "offer_made",
    admin.name, `Offer ${formatPrice(amount)} sent`,
  );

  const statusUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/sell/status/${sub.token}`;
  const t = emailTemplates.offerMade(
    sub.seller_name,
    carTitle(sub) || "car",
    formatPrice(amount),
    statusUrl,
  );
  await notifier.sendEmail({ to: sub.email, subject: t.subject, html: t.html });
  await notifier.sendSms({
    to: sub.phone,
    body: `Adam Hall here — our offer on your ${carTitle(sub)} is ${formatPrice(amount)}. Details in your email. Any questions, just call.`,
  });

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function declineSubmission(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const submissionId = String(formData.get("submission_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!submissionId || reason.length < 5) {
    return { ok: false, error: "Give the seller a real reason — it matters." };
  }

  const { data: sub } = await admin.supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle<Submission>();
  if (!sub) return { ok: false, error: "Submission not found." };

  const { error } = await admin.supabase
    .from("submissions")
    .update({ status: "declined", declined_reason: reason })
    .eq("id", submissionId);
  if (error) return { ok: false, error: error.message };

  await logEvent(admin.supabase, "submission", submissionId, sub.status, "declined", admin.name, reason);

  const t = emailTemplates.declined(sub.seller_name, carTitle(sub) || "car", reason);
  await notifier.sendEmail({ to: sub.email, subject: t.subject, html: t.html });

  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ── Settlement checklist ────────────────────────────────────────────

export async function tickChecklistItem(
  submissionId: string,
  key: ChecklistKey,
  done: boolean,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!CHECKLIST_ITEMS.some((i) => i.key === key)) {
    return { ok: false, error: "Unknown checklist item." };
  }

  const { error } = await admin.supabase
    .from("settlement_checklists")
    .upsert(
      {
        submission_id: submissionId,
        [`${key}_done`]: done,
        [`${key}_at`]: done ? new Date().toISOString() : null,
        [`${key}_by`]: done ? admin.name : null,
      },
      { onConflict: "submission_id" },
    );
  if (error) return { ok: false, error: error.message };

  const label = CHECKLIST_ITEMS.find((i) => i.key === key)!.label;
  await logEvent(
    admin.supabase, "submission", submissionId, null,
    done ? "checklist_ticked" : "checklist_unticked",
    admin.name, label,
  );

  revalidatePath(`/admin/submissions/${submissionId}`);
  return { ok: true };
}

// ── Inventory ───────────────────────────────────────────────────────

const carSchema = z.object({
  id: z.string().uuid().optional(),
  make: z.string().trim().min(2),
  model: z.string().trim().min(1),
  badge: z.string().trim().max(60).optional(),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  price: z.coerce.number().positive().max(1_000_000),
  odometer_km: z.coerce.number().int().min(0),
  body_type: z.string().trim().min(2),
  transmission: z.string().trim().min(2),
  fuel: z.string().trim().min(2),
  drivetrain: z.string().trim().max(20).optional(),
  colour: z.string().trim().max(40).optional(),
  seats: z.coerce.number().int().min(1).max(12).optional(),
  description: z.string().trim().max(6000).optional(),
  adams_take: z.string().trim().max(600).optional(),
  video_url: z.string().trim().url().optional().or(z.literal("")),
  ppsr_clear: z.boolean(),
  service_history: z.enum(["full", "partial", "none", "unknown"]),
  inspection_summary: z.string().trim().max(1000).optional(),
  photos: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })).max(24),
  source_submission_id: z.string().uuid().optional(),
});

export type CarInput = z.input<typeof carSchema>;

export async function saveCar(input: CarInput): Promise<AdminActionState & { id?: string; slug?: string }> {
  const admin = await requireAdmin();
  const parsed = carSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue.path.join(".")}: ${issue.message}` };
  }
  const d = parsed.data;

  const row = {
    make: d.make,
    model: d.model,
    badge: d.badge ?? null,
    year: d.year,
    price: d.price,
    odometer_km: d.odometer_km,
    body_type: d.body_type,
    transmission: d.transmission,
    fuel: d.fuel,
    drivetrain: d.drivetrain ?? null,
    colour: d.colour ?? null,
    seats: d.seats ?? null,
    description: d.description ?? null,
    adams_take: d.adams_take ?? null,
    video_url: d.video_url || null,
    ppsr_clear: d.ppsr_clear,
    service_history: d.service_history,
    inspection_summary: d.inspection_summary ?? null,
    photos: d.photos,
  };

  if (d.id) {
    // Price moves are business-significant — capture them in the audit
    // trail so repricing history is never a mystery.
    const { data: existing } = await admin.supabase
      .from("cars")
      .select("price, slug")
      .eq("id", d.id)
      .maybeSingle();

    const { error } = await admin.supabase.from("cars").update(row).eq("id", d.id);
    if (error) return { ok: false, error: error.message };

    if (existing && Number(existing.price) !== d.price) {
      await logEvent(
        admin.supabase, "car", d.id, null, "price_updated", admin.name,
        `${formatPrice(Number(existing.price))} → ${formatPrice(d.price)}`,
      );
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/cars");
    if (existing?.slug) revalidatePath(`/cars/${existing.slug}`);
    return { ok: true, id: d.id };
  }

  const slugBase = slugify(`${d.year} ${d.make} ${d.model} ${d.badge ?? ""}`);
  // Slugs must be unique; suffix only on collision.
  let slug = slugBase;
  for (let n = 2; n < 20; n++) {
    const { data: clash } = await admin.supabase
      .from("cars").select("id").eq("slug", slug).maybeSingle();
    if (!clash) break;
    slug = `${slugBase}-${n}`;
  }

  const { data: created, error } = await admin.supabase
    .from("cars")
    .insert({ ...row, slug, status: "draft", source_submission_id: d.source_submission_id ?? null })
    .select("id, slug")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Insert failed" };

  await logEvent(admin.supabase, "car", created.id, null, "draft", admin.name, "Listing created");
  revalidatePath("/admin/inventory");
  return { ok: true, id: created.id, slug: created.slug };
}

// One-click "list another one like it": copies everything except photos
// stay shared URLs, and the copy always starts as a draft.
export async function duplicateCar(
  carId: string,
): Promise<AdminActionState & { id?: string }> {
  const admin = await requireAdmin();
  const { data: car } = await admin.supabase
    .from("cars")
    .select("*")
    .eq("id", carId)
    .maybeSingle();
  if (!car) return { ok: false, error: "Car not found." };

  const result = await saveCar({
    make: car.make,
    model: car.model,
    badge: car.badge ?? undefined,
    year: car.year,
    price: Number(car.price),
    odometer_km: car.odometer_km,
    body_type: car.body_type,
    transmission: car.transmission,
    fuel: car.fuel,
    drivetrain: car.drivetrain ?? undefined,
    colour: car.colour ?? undefined,
    seats: car.seats ?? undefined,
    description: car.description ?? undefined,
    adams_take: car.adams_take ?? undefined,
    video_url: car.video_url ?? "",
    ppsr_clear: false, // every car gets its own PPSR check — never inherited
    service_history: "unknown",
    inspection_summary: undefined,
    photos: car.photos ?? [],
  });
  if (!result.ok) return result;

  revalidatePath("/admin/inventory");
  return { ok: true, id: result.id };
}

export async function setCarStatus(
  carId: string,
  next: "draft" | "published" | "sold" | "archived",
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const { data: car } = await admin.supabase
    .from("cars")
    .select("id, status, slug, make, model, year, badge, price")
    .eq("id", carId)
    .maybeSingle();
  if (!car) return { ok: false, error: "Car not found." };

  const patch: Record<string, unknown> = { status: next };
  if (next === "published" && car.status !== "published") patch.published_at = new Date().toISOString();
  if (next === "sold") patch.sold_at = new Date().toISOString();

  const { error } = await admin.supabase.from("cars").update(patch).eq("id", carId);
  if (error) return { ok: false, error: error.message };

  await logEvent(admin.supabase, "car", carId, car.status, next, admin.name);

  // Watchlist matching happens on publish — see matchWatchlist below.
  if (next === "published" && car.status !== "published") {
    await matchWatchlist(carId);
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/cars");
  revalidatePath("/");
  return { ok: true };
}

// Notify every active watchlist alert matching a freshly published car.
async function matchWatchlist(carId: string) {
  const admin = await requireAdmin();
  const { data: car } = await admin.supabase
    .from("cars").select("*").eq("id", carId).maybeSingle();
  if (!car) return;

  const { data: alerts } = await admin.supabase
    .from("watchlist_alerts")
    .select("*")
    .eq("active", true)
    .ilike("make", car.make);
  if (!alerts) return;

  const matches = alerts.filter((a) => {
    if (a.model && a.model.toLowerCase() !== car.model.toLowerCase()) return false;
    if (a.max_price && Number(car.price) > Number(a.max_price)) return false;
    return true;
  });

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/cars/${car.slug}`;
  const name = carTitle(car);
  for (const alert of matches) {
    const t = emailTemplates.watchlistMatch(alert.email, name, formatPrice(car.price), url);
    await notifier.sendEmail({ to: alert.email, subject: t.subject, html: t.html });
    await admin.supabase
      .from("watchlist_alerts")
      .update({ last_notified_at: new Date().toISOString() })
      .eq("id", alert.id);
  }
}

// ── Convert accepted submission to listing ──────────────────────────

// Pre-fills a draft listing from the seller's form and copies their photos
// from the private submissions bucket into the public listing bucket.
export async function convertToListing(
  submissionId: string,
): Promise<AdminActionState & { id?: string }> {
  const admin = await requireAdmin();

  const { data: sub } = await admin.supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle<Submission>();
  if (!sub) return { ok: false, error: "Submission not found." };
  if (sub.status !== "accepted" && sub.status !== "settled") {
    return { ok: false, error: "Accept the deal before converting it to a listing." };
  }
  if (!sub.make || !sub.model || !sub.year) {
    return { ok: false, error: "Fill in make, model and year on the submission first." };
  }

  const { data: valuation } = await admin.supabase
    .from("valuations")
    .select("expected_retail")
    .eq("submission_id", submissionId)
    .maybeSingle();

  const { data: photos } = await admin.supabase
    .from("submission_photos")
    .select("path, kind")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  const copied: { url: string; alt?: string }[] = [];
  for (const [i, p] of (photos ?? []).entries()) {
    const { data: blob, error: dlError } = await admin.supabase.storage
      .from("submission-photos")
      .download(p.path);
    if (dlError || !blob) continue;
    const destPath = `${submissionId}/${i}.jpg`;
    const { error: upError } = await admin.supabase.storage
      .from("car-photos")
      .upload(destPath, blob, { contentType: "image/jpeg", upsert: true });
    if (upError) continue;
    const { data: pub } = admin.supabase.storage.from("car-photos").getPublicUrl(destPath);
    copied.push({ url: pub.publicUrl });
  }

  const result = await saveCar({
    make: sub.make,
    model: sub.model,
    year: sub.year,
    price: valuation?.expected_retail ?? Math.max(1, Number(sub.asking_price ?? 0)) ,
    odometer_km: sub.odometer_km ?? 0,
    body_type: "To confirm",
    transmission: "To confirm",
    fuel: "To confirm",
    service_history: sub.service_history ?? "unknown",
    ppsr_clear: false,
    description: sub.condition_notes ?? undefined,
    photos: copied,
    source_submission_id: sub.id,
  });
  if (!result.ok) return result;

  revalidatePath("/admin/inventory");
  return { ok: true, id: result.id };
}

// ── Enquiries ───────────────────────────────────────────────────────

export async function setEnquiryStatus(
  enquiryId: string,
  next: "new" | "contacted" | "closed",
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const { error } = await admin.supabase
    .from("enquiries")
    .update({ status: next })
    .eq("id", enquiryId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/enquiries");
  return { ok: true };
}
