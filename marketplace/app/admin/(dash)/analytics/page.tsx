import { requireAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import type { StatusEvent, Submission, Valuation } from "@/lib/types";

// The beginnings of the Adam Hall Operating System in data: every priced
// car teaches the system what Adam's judgement looks like.
export default async function AnalyticsPage() {
  const { supabase } = await requireAdmin();

  const [subsRes, valsRes, eventsRes] = await Promise.all([
    supabase.from("submissions").select("*").returns<Submission[]>(),
    supabase.from("valuations").select("*").returns<Valuation[]>(),
    supabase
      .from("status_events")
      .select("*")
      .eq("entity_type", "submission")
      .order("created_at", { ascending: true })
      .returns<StatusEvent[]>(),
  ]);

  const subs = subsRes.data ?? [];
  const vals = valsRes.data ?? [];
  const events = eventsRes.data ?? [];

  // Offer outcomes
  const offered = subs.filter((s) =>
    ["offer_made", "accepted", "declined", "settled"].includes(s.status),
  );
  const accepted = subs.filter((s) => ["accepted", "settled"].includes(s.status));
  const declined = subs.filter((s) => s.status === "declined");
  const acceptRate =
    accepted.length + declined.length > 0
      ? Math.round((accepted.length / (accepted.length + declined.length)) * 100)
      : null;

  // Average margin by make (from valuation worksheets)
  const subById = new Map(subs.map((s) => [s.id, s]));
  const byMake = new Map<string, { total: number; count: number }>();
  for (const v of vals) {
    const make = subById.get(v.submission_id)?.make;
    if (!make || v.margin == null) continue;
    const entry = byMake.get(make) ?? { total: 0, count: 0 };
    entry.total += Number(v.margin);
    entry.count += 1;
    byMake.set(make, entry);
  }
  const marginRows = [...byMake.entries()]
    .map(([make, { total, count }]) => ({ make, avg: total / count, count }))
    .sort((a, b) => b.avg - a.avg);

  // Time from submission to offer
  const receivedAt = new Map<string, number>();
  const offerAt = new Map<string, number>();
  for (const e of events) {
    const t = new Date(e.created_at).getTime();
    if (e.to_status === "new" && !receivedAt.has(e.entity_id)) receivedAt.set(e.entity_id, t);
    if (e.to_status === "offer_made" && !offerAt.has(e.entity_id)) offerAt.set(e.entity_id, t);
  }
  const offerHours: number[] = [];
  for (const [id, start] of receivedAt) {
    const end = offerAt.get(id);
    if (end && end > start) offerHours.push((end - start) / 3_600_000);
  }
  const avgOfferHours =
    offerHours.length > 0
      ? offerHours.reduce((a, b) => a + b, 0) / offerHours.length
      : null;

  const tiles = [
    {
      label: "Offers made",
      value: String(offered.length),
      sub: `${subs.length} submissions all-time`,
    },
    {
      label: "Accept rate",
      value: acceptRate != null ? `${acceptRate}%` : "—",
      sub: `${accepted.length} accepted · ${declined.length} declined`,
    },
    {
      label: "Avg time to offer",
      value:
        avgOfferHours != null
          ? avgOfferHours < 48
            ? `${Math.round(avgOfferHours)}h`
            : `${(avgOfferHours / 24).toFixed(1)}d`
          : "—",
      sub: `${offerHours.length} timed offers`,
    },
    {
      label: "Worksheets filled",
      value: String(vals.length),
      sub: "each one trains the pricing dataset",
    },
  ];

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-1">Offer analytics</h1>
      <p className="text-sm text-stone-500 mb-6">
        Live from the pipeline. This is Adam&apos;s pricing judgement becoming data.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-5">
            <p className="text-3xl font-display font-extrabold text-forest-700">{t.value}</p>
            <p className="text-sm font-semibold text-stone-600 mt-1">{t.label}</p>
            <p className="text-xs text-stone-400 mt-0.5">{t.sub}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display font-bold text-lg mt-10 mb-4">Average margin by make</h2>
      {marginRows.length === 0 ? (
        <div className="card p-8 text-center text-stone-500 text-sm">
          Fill in valuation worksheets and this table builds itself.
        </div>
      ) : (
        <div className="card divide-y divide-stone-100">
          {marginRows.map((r) => (
            <div key={r.make} className="p-4 flex items-center gap-4">
              <p className="font-bold w-32">{r.make}</p>
              <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest-600 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(4, (r.avg / Math.max(...marginRows.map((x) => x.avg))) * 100))}%`,
                  }}
                />
              </div>
              <p className="font-bold text-forest-700 w-24 text-right">{formatPrice(r.avg)}</p>
              <p className="text-xs text-stone-400 w-14 text-right">
                {r.count} car{r.count === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
