"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifier } from "@/lib/notify";
import { TIME_WINDOWS } from "@/lib/testdrive-windows";

export interface TestDriveActionState {
  ok: boolean;
  error?: string;
}

// TIME_WINDOWS lives in lib/testdrive-windows.ts — "use server" modules
// may only export async functions.

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const testDriveSchema = z
  .object({
    car_id: z.string().uuid(),
    name: z.string().trim().min(2, "Tell us your name"),
    phone: z.string().trim().min(8, "We need a phone number to call you back"),
    preferred_date: z
      .string()
      .trim()
      .min(1, "Pick a preferred date")
      .refine((val) => !Number.isNaN(Date.parse(val)), "Pick a valid date"),
    time_window: z.enum(TIME_WINDOWS, {
      message: "Pick a time window that suits you",
    }),
    licence_confirmed: z.string().optional(),
    message: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.licence_confirmed !== "on") {
      ctx.addIssue({
        code: "custom",
        path: ["licence_confirmed"],
        message: "You'll need a current licence to test drive.",
      });
    }
    if (!Number.isNaN(Date.parse(data.preferred_date)) && data.preferred_date < todayIso()) {
      ctx.addIssue({
        code: "custom",
        path: ["preferred_date"],
        message: "Pick a date that's not in the past",
      });
    }
  });

export async function bookTestDrive(
  _prev: TestDriveActionState,
  formData: FormData,
): Promise<TestDriveActionState> {
  const parsed = testDriveSchema.safeParse({
    car_id: formData.get("car_id"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    preferred_date: formData.get("preferred_date"),
    time_window: formData.get("time_window"),
    licence_confirmed: formData.get("licence_confirmed") || undefined,
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { car_id, name, phone, preferred_date, time_window, message } = parsed.data;
  const preferred_time = `${preferred_date} · ${time_window}`;
  const fullMessage = message ? `Licence confirmed. ${message}` : "Licence confirmed.";

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert({
    car_id,
    kind: "book_look",
    name,
    phone,
    preferred_time,
    message: fullMessage,
    status: "new",
  });
  if (error) {
    console.error("bookTestDrive:", error.message);
    return { ok: false, error: "Something went wrong on our end. Please call us instead." };
  }

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    const { data: car } = await supabase
      .from("cars")
      .select("make, model, year, badge")
      .eq("id", car_id)
      .maybeSingle();
    const carName = car ? `${car.year} ${car.make} ${car.model}` : "a listed car";
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#16211b">
        <p style="font-size:18px;font-weight:700;color:#1e5c41;margin:0 0 16px">Adam Hall — Buy My Car</p>
        <p><strong>${name}</strong> (${phone}) wants to test drive the ${carName}.</p>
        <p>Preferred: ${preferred_date} — ${time_window}</p>
        ${message ? `<p>Message: ${message}</p>` : ""}
        <p style="color:#78716c;font-size:13px;margin-top:32px">Call to lock in the exact time — it's in the admin inbox.</p>
      </div>`;
    await notifier.sendEmail({
      to: adminEmail,
      subject: `Test drive request: ${carName}`,
      html,
    });
  }

  return { ok: true };
}
