import "server-only";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import type { Comparable } from "@/lib/valuation";

// The comparable set behind the instant valuation tool, drawn from Adam's own
// book. Two sources, and the distinction matters to the maths:
//
//   paid   — offers Adam has actually made on cars sellers brought him. This
//            is the target variable: it is literally "what will Adam pay me".
//   retail — cars on the lot, live or sold. Marked down to a buy price by the
//            estimator using the spread measured between the two sets.
//
// Cached for an hour. The set changes when Adam prices a car, not by the
// second, and every quote would otherwise hit the database twice.

interface CarRow {
  make: string;
  model: string;
  year: number;
  odometer_km: number;
  price: number;
}

interface SubmissionRow {
  make: string | null;
  model: string | null;
  year: number | null;
  odometer_km: number | null;
  offer_amount: number | null;
}

export const getComparables = unstable_cache(
  async (): Promise<Comparable[]> => {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

    try {
      const supabase = createServiceClient();

      const [cars, submissions] = await Promise.all([
        supabase
          .from("cars")
          .select("make, model, year, odometer_km, price")
          .in("status", ["published", "sold"])
          .limit(1000)
          .returns<CarRow[]>(),
        // Any status where Adam has put a number on the car. An offer he made
        // and the seller declined still represents his valuation.
        supabase
          .from("submissions")
          .select("make, model, year, odometer_km, offer_amount")
          .in("status", ["offer_made", "accepted", "settled"])
          .not("offer_amount", "is", null)
          .limit(1000)
          .returns<SubmissionRow[]>(),
      ]);

      const out: Comparable[] = [];

      for (const c of cars.data ?? []) {
        if (!c.make || !c.model || !c.year || c.price == null) continue;
        out.push({
          make: c.make,
          model: c.model,
          year: c.year,
          odometerKm: c.odometer_km ?? 0,
          price: Number(c.price),
          basis: "retail",
        });
      }

      // Sellers hand-type make and model, so rows missing either are no use
      // as comparables even though they are perfectly good submissions.
      for (const s of submissions.data ?? []) {
        if (!s.make || !s.model || !s.year || s.offer_amount == null) continue;
        out.push({
          make: s.make,
          model: s.model,
          year: s.year,
          odometerKm: s.odometer_km ?? 0,
          price: Number(s.offer_amount),
          basis: "paid",
        });
      }

      return out;
    } catch (err) {
      console.error("getComparables:", err);
      return [];
    }
  },
  ["valuation-comparables"],
  { revalidate: 3600, tags: ["comparables"] },
);
