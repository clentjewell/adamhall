import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [newSubs, activeEnquiries, liveListings, soldThisMonth, recentEvents] =
    await Promise.all([
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("cars").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("cars").select("id", { count: "exact", head: true }).eq("status", "sold").gte("sold_at", monthStart.toISOString()),
      supabase.from("status_events").select("*").order("created_at", { ascending: false }).limit(8),
    ]);

  const tiles = [
    { label: "New submissions", value: newSubs.count ?? 0, href: "/admin/submissions?status=new" },
    { label: "Open enquiries", value: activeEnquiries.count ?? 0, href: "/admin/enquiries" },
    { label: "Live listings", value: liveListings.count ?? 0, href: "/admin/inventory" },
    { label: "Sold this month", value: soldThisMonth.count ?? 0, href: "/admin/inventory" },
  ];

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="card p-5 hover:border-forest-200 transition-colors">
            <p className="text-3xl font-display font-extrabold text-forest-700">{t.value}</p>
            <p className="text-sm font-semibold text-stone-500 mt-1">{t.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="font-display font-bold text-lg mt-10 mb-4">Latest activity</h2>
      <div className="card divide-y divide-stone-100">
        {(recentEvents.data ?? []).length === 0 && (
          <p className="p-5 text-sm text-stone-500">
            Nothing yet. Activity shows up here as submissions and listings move.
          </p>
        )}
        {(recentEvents.data ?? []).map((e) => (
          <div key={e.id} className="p-4 flex items-center gap-3 text-sm">
            <StatusBadge status={e.to_status} />
            <span className="text-stone-600 truncate">
              {e.entity_type} · {e.actor}
              {e.note ? ` — ${e.note}` : ""}
            </span>
            <span className="ml-auto text-xs text-stone-400 shrink-0">
              {formatDateTime(e.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
