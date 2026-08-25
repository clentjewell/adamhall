"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { notifier } from "@/lib/notify";
import { formatPrice } from "@/lib/format";
import type { EnquiryStatus } from "@/lib/types";

export interface FinanceActionState {
  ok: boolean;
  error?: string;
}

const financeEnquirySchema = z.object({
  car_id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Tell us your name"),
  phone: z.string().trim().min(8, "We need a phone number to call you back"),
  email: z.string().trim().email("That email doesn't look right"),
  amount: z.coerce.number().positive().max(1_000_000).optional(),
  deposit: z.coerce.number().min(0).max(1_000_000).optional(),
  term_months: z.coerce.number().int().min(1).max(120).optional(),
  message: z.string().trim().max(2000).optional(),
  consent: z.string().refine((v) => v === "on", {
    message: "We need your consent to pass your details to our finance partner.",
  }),
});

export async function submitFinanceEnquiry(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const parsed = financeEnquirySchema.safeParse({
    car_id: formData.get("car_id") || undefined,
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    amount: formData.get("amount") || undefined,
    deposit: formData.get("deposit") || undefined,
    term_months: formData.get("term_months") || undefined,
    message: formData.get("message") || undefined,
    consent: formData.get("consent") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("finance_enquiries").insert({
    car_id: parsed.data.car_id ?? null,
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    amount: parsed.data.amount ?? null,
    deposit: parsed.data.deposit ?? null,
    term_months: parsed.data.term_months ?? null,
    message: parsed.data.message ?? null,
    consent: true,
    status: "new",
  });
  if (error) {
    console.error("submitFinanceEnquiry:", error.message);
    return { ok: false, error: "Something went wrong on our end. Please call us instead." };
  }

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    const amountLine = parsed.data.amount
      ? ` — around ${formatPrice(parsed.data.amount)} to finance`
      : "";
    await notifier.sendEmail({
      to: adminEmail,
      subject: `New finance enquiry: ${parsed.data.name}`,
      html: `<p><strong>${parsed.data.name}</strong> (${parsed.data.phone}, ${parsed.data.email}) wants help financing a car${amountLine}. It's in the admin finance queue.</p>`,
    });
  }

  return { ok: true };
}

const financeStatusSchema = z.enum(["new", "contacted", "closed"]);

export async function setFinanceEnquiryStatus(
  enquiryId: string,
  next: EnquiryStatus,
): Promise<FinanceActionState> {
  const admin = await requireAdmin();
  const parsed = financeStatusSchema.safeParse(next);
  if (!parsed.success) return { ok: false, error: "Bad status." };

  const { error } = await admin.supabase
    .from("finance_enquiries")
    .update({ status: parsed.data })
    .eq("id", enquiryId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/finance");
  return { ok: true };
}
