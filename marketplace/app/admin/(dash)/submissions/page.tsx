import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { carTitle, formatKm, formatPrice, timeAgo } from "@/lib/format";
import { SUBMISSION_STATUS_FLOW, SUBMISSION_STATUS_LABELS, type Submission, type SubmissionStatus } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function SubmissionsPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const { status } = await searchParams;

  let query = supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (status && SUBMISSION_STATUS_FLOW.includes(status as SubmissionStatus)) {
    query = query.eq("status", status);
  }
  const { data: submissions } = await query.returns<Submission[]>();

  const { data: counts } = await supabase
    .from("submissions")
    .select("status")
    .returns<{ status: SubmissionStatus }[]>();
  const countBy = new Map<string, number>();
  for (const row of counts ?? []) {
    countBy.set(row.status, (countBy.get(row.status) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-6">Submissions</h1>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
        <Link
          href="/admin/submissions"
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${!status ? "bg-forest-600 text-white" : "bg-white border border-stone-200 text-stone-600"}`}
        >
          All ({counts?.length ?? 0})
        </Link>
        {SUBMISSION_STATUS_FLOW.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions?status=${s}`}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${status === s ? "bg-forest-600 text-white" : "bg-white border border-stone-200 text-stone-600"}`}
          >
            {SUBMISSION_STATUS_LABELS[s]} ({countBy.get(s) ?? 0})
          </Link>
        ))}
      </div>

      {(submissions ?? []).length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          Nothing in this pile. The /sell page feeds cars straight in here.
        </div>
      ) : (
        <div className="space-y-3">
          {(submissions ?? []).map((s) => (
            <Link
              key={s.id}
              href={`/admin/submissions/${s.id}`}
              className="card p-5 flex flex-wrap items-center gap-x-5 gap-y-2 hover:border-forest-200 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold truncate">
                  {carTitle(s) || s.rego || "Car details pending"}
                  {s.rego && (
                    <span className="ml-2 text-xs font-mono font-semibold text-stone-400">
                      {s.rego} {s.rego_state}
                    </span>
                  )}
                </p>
                <p className="text-sm text-stone-500 mt-0.5">
                  {s.seller_name} · {s.suburb ?? "suburb n/a"} · {formatKm(s.odometer_km)}
                  {s.asking_price ? ` · wants ${formatPrice(s.asking_price)}` : ""}
                </p>
              </div>
              {s.trade_target_car_id && (
                <span className="text-xs font-bold text-amber-accent bg-amber-soft px-2.5 py-1 rounded-full">
                  TRADE-IN
                </span>
              )}
              <StatusBadge status={s.status} />
              <span className="text-xs text-stone-400 w-16 text-right">{timeAgo(s.created_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
