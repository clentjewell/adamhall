"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getComparables } from "@/lib/comparables";
import { estimateValuation, type ValuationResult } from "@/lib/valuation";

const quoteSchema = z.object({
  make: z.string().trim().min(1, "Tell us the make").max(40),
  model: z.string().trim().min(1, "Tell us the model").max(60),
  year: z.coerce
    .number()
    .int()
    .min(1990, "We estimate on cars from 1990 onwards")
    .max(new Date().getFullYear() + 1),
  odometer_km: z.coerce
    .number()
    .int()
    .min(0)
    .max(500_000, "That reading is outside what we can estimate on"),
  condition: z.enum(["excellent", "very_good", "good", "fair"]),
  service_history: z.enum(["full", "partial", "none", "unknown"]),
  had_accidents: z.boolean(),
  suburb: z.string().trim().max(80).optional(),
});

export type QuotePayload = z.input<typeof quoteSchema>;

export interface QuoteResponse {
  ok: boolean;
  /** Present when validation passed, whether or not an estimate was produced. */
  result?: ValuationResult;
  error?: string;
}

/**
 * Give an instant indicative range for a car, and log it.
 *
 * Contact details are deliberately not required. The seller sees the number
 * first and decides afterwards whether to go further, which is the whole
 * point of an instant quote and avoids the hard stop DD15 raises about the
 * enquiry form.
 */
export async function getInstantQuote(
  payload: QuotePayload,
): Promise<QuoteResponse> {
  const parsed = quoteSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;

  const comparables = await getComparables();
  const result = estimateValuation(
    {
      make: d.make,
      model: d.model,
      year: d.year,
      odometerKm: d.odometer_km,
      condition: d.condition,
      serviceHistory: d.service_history,
      hadAccidents: d.had_accidents,
    },
    comparables,
  );

  // Every quote is a lead, including the ones the tool could not price —
  // those are the most useful, because they show what Adam is being asked
  // about and has no data on. A logging failure never blocks the answer.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createServiceClient();
      await supabase.from("quote_requests").insert({
        make: d.make,
        model: d.model,
        year: d.year,
        odometer_km: d.odometer_km,
        condition: d.condition,
        service_history: d.service_history,
        had_accidents: d.had_accidents,
        suburb: d.suburb ?? null,
        estimate_low: result.ok ? result.low : null,
        estimate_high: result.ok ? result.high : null,
        estimate_midpoint: result.ok ? result.midpoint : null,
        confidence: result.ok ? result.confidence : null,
        match_tier: result.ok ? result.matchTier : null,
        comparable_count: result.ok ? result.comparableCount : null,
        unavailable_reason: result.ok ? null : result.reason,
      });
    } catch (err) {
      console.error("getInstantQuote log:", err);
    }
  }

  return { ok: true, result };
}
