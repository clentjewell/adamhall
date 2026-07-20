import "server-only";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";

// "Speed as a feature": median hours from submission received to Adam's
// first action, computed from the real audit trail. Cached for an hour.
export const getResponseStat = unstable_cache(
  async (): Promise<{ label: string; sampleSize: number } | null> => {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("status_events")
        .select("entity_id, to_status, created_at")
        .eq("entity_type", "submission")
        .order("created_at", { ascending: true })
        .limit(1000);
      if (error || !data) return null;

      const received = new Map<string, number>();
      const firstAction = new Map<string, number>();
      for (const ev of data) {
        const t = new Date(ev.created_at).getTime();
        if (ev.to_status === "new") {
          if (!received.has(ev.entity_id)) received.set(ev.entity_id, t);
        } else if (!firstAction.has(ev.entity_id)) {
          firstAction.set(ev.entity_id, t);
        }
      }

      const hours: number[] = [];
      for (const [id, start] of received) {
        const end = firstAction.get(id);
        if (end && end > start) hours.push((end - start) / 3_600_000);
      }
      if (hours.length === 0) return null;

      hours.sort((a, b) => a - b);
      const median = hours[Math.floor(hours.length / 2)];
      const label =
        median <= 24
          ? "same day"
          : median <= 48
            ? "next day"
            : `${Math.round(median / 24)} days`;
      return { label, sampleSize: hours.length };
    } catch {
      return null;
    }
  },
  ["response-stat"],
  { revalidate: 3600 },
);
