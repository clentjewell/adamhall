import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/admin";
import { carTitle, formatDateTime, formatKm, formatPrice } from "@/lib/format";
import type {
  SettlementChecklist,
  StatusEvent,
  Submission,
  SubmissionPhoto,
  Valuation,
} from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import PipelinePanel from "@/components/admin/PipelinePanel";
import ValuationForm from "@/components/admin/ValuationForm";
import ChecklistPanel from "@/components/admin/ChecklistPanel";
import ConvertButton from "@/components/admin/ConvertButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: sub } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle<Submission>();
  if (!sub) notFound();

  const [photosRes, valuationRes, checklistRes, eventsRes, tradeCarRes, listingRes] =
    await Promise.all([
      supabase.from("submission_photos").select("*").eq("submission_id", id).order("created_at").returns<SubmissionPhoto[]>(),
      supabase.from("valuations").select("*").eq("submission_id", id).maybeSingle<Valuation>(),
      supabase.from("settlement_checklists").select("*").eq("submission_id", id).maybeSingle<SettlementChecklist>(),
      supabase.from("status_events").select("*").eq("entity_type", "submission").eq("entity_id", id).order("created_at", { ascending: false }).returns<StatusEvent[]>(),
      sub.trade_target_car_id
        ? supabase.from("cars").select("slug, make, model, year, badge, price").eq("id", sub.trade_target_car_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("cars").select("id, slug, status").eq("source_submission_id", id).maybeSingle(),
    ]);

  // Private bucket: photos are served via short-lived signed URLs.
  const signedPhotos: { path: string; url: string | null }[] = await Promise.all(
    (photosRes.data ?? []).map(async (p) => {
      const { data } = await supabase.storage
        .from("submission-photos")
        .createSignedUrl(p.path, 3600);
      return { path: p.path, url: data?.signedUrl ?? null };
    }),
  );

  const conditionRows: [string, string | null][] = [
    ["Service history", sub.service_history],
    ["Accidents", sub.had_accidents == null ? null : sub.had_accidents ? `Yes — ${sub.accident_notes ?? "no detail"}` : "No"],
    ["Tyres", sub.tyres_condition],
    ["Interior", sub.interior_condition],
    ["Mechanical", sub.mechanical_issues],
    ["Notes", sub.condition_notes],
  ];

  return (
    <div>
      <Link href="/admin/submissions" className="btn-ghost text-sm -ml-3 mb-3">
        <ArrowLeft size={16} weight="bold" />
        Queue
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="font-display font-extrabold text-2xl">
          {carTitle(sub) || sub.rego || "Submission"}
        </h1>
        <StatusBadge status={sub.status} />
        {sub.rego && (
          <span className="font-mono text-sm font-bold text-stone-400">
            {sub.rego} ({sub.rego_state})
          </span>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6 min-w-0">
          {/* Photos */}
          <section className="card p-5">
            <h2 className="font-bold mb-3">Seller photos ({signedPhotos.length})</h2>
            {signedPhotos.length === 0 ? (
              <p className="text-sm text-stone-500">No photos supplied.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {signedPhotos.map((p, i) =>
                  p.url ? (
                    <a key={p.path} href={p.url} target="_blank" rel="noreferrer" className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-100">
                      <Image src={p.url} alt={`Seller photo ${i + 1}`} fill sizes="240px" className="object-cover" unoptimized />
                    </a>
                  ) : (
                    <div key={p.path} className="aspect-[4/3] rounded-lg bg-stone-100 flex items-center justify-center text-xs text-stone-400">
                      Signed URL unavailable
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {/* Car + condition, exactly as the seller told it */}
          <section className="card p-5">
            <h2 className="font-bold mb-3">What the seller told us</h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="font-semibold text-stone-500">Odometer</dt>
                <dd className="font-bold">{formatKm(sub.odometer_km)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-stone-500">Wants</dt>
                <dd className="font-bold">
                  {sub.asking_price ? formatPrice(sub.asking_price) : "No number given"}
                  {sub.sell_timeframe ? ` · ${sub.sell_timeframe}` : ""}
                </dd>
              </div>
              {conditionRows.map(([k, v]) =>
                v ? (
                  <div key={k}>
                    <dt className="font-semibold text-stone-500">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ) : null,
              )}
            </dl>
          </section>

          {/* Seller contact */}
          <section className="card p-5">
            <h2 className="font-bold mb-3">Seller</h2>
            <p className="font-semibold">{sub.seller_name}</p>
            <p className="text-sm text-stone-600 mt-1">
              <a href={`tel:${sub.phone}`} className="text-forest-700 font-semibold">{sub.phone}</a>
              {" · "}
              <a href={`mailto:${sub.email}`} className="text-forest-700 font-semibold">{sub.email}</a>
              {sub.suburb ? ` · ${sub.suburb}` : ""}
            </p>
            {tradeCarRes.data && (
              <p className="mt-3 text-sm bg-amber-soft rounded-lg px-3 py-2">
                <span className="font-bold text-amber-accent">Trade-in deal:</span>{" "}
                they want the{" "}
                <Link href={`/cars/${tradeCarRes.data.slug}`} className="font-semibold underline">
                  {tradeCarRes.data.year} {tradeCarRes.data.make} {tradeCarRes.data.model}
                </Link>{" "}
                ({formatPrice(tradeCarRes.data.price)}). Price both sides together.
              </p>
            )}
          </section>

          {/* Audit trail */}
          <section className="card p-5">
            <h2 className="font-bold mb-3">History</h2>
            <ol className="space-y-2.5">
              {(eventsRes.data ?? []).map((e) => (
                <li key={e.id} className="flex items-center gap-3 text-sm">
                  <StatusBadge status={e.to_status} />
                  <span className="text-stone-600 truncate">
                    {e.actor}
                    {e.note ? ` — ${e.note}` : ""}
                  </span>
                  <span className="ml-auto text-xs text-stone-400 shrink-0">
                    {formatDateTime(e.created_at)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <ValuationForm
            submissionId={sub.id}
            valuation={valuationRes.data ?? null}
            askingPrice={sub.asking_price}
          />
          <PipelinePanel submission={sub} offerDefault={valuationRes.data?.offer_amount ?? null} />
          {(sub.status === "accepted" || sub.status === "settled") && (
            <>
              <ChecklistPanel submissionId={sub.id} checklist={checklistRes.data ?? null} />
              <ConvertButton
                submissionId={sub.id}
                existing={listingRes.data ? { id: listingRes.data.id, slug: listingRes.data.slug } : null}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
