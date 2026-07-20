import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import type { Enquiry } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import EnquiryActions from "@/components/admin/EnquiryActions";

export default async function EnquiriesPage() {
  const { supabase } = await requireAdmin();
  const { data: enquiries } = await supabase
    .from("enquiries")
    .select("*, cars(slug, make, model, year, badge)")
    .order("created_at", { ascending: false })
    .returns<Enquiry[]>();

  const open = (enquiries ?? []).filter((e) => e.status !== "closed");
  const closed = (enquiries ?? []).filter((e) => e.status === "closed");

  const row = (e: Enquiry) => (
    <div key={e.id} className="p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {e.name}
          <a href={`tel:${e.phone}`} className="ml-2 text-forest-700 text-sm font-bold">
            {e.phone}
          </a>
        </p>
        <p className="text-sm text-stone-500 truncate">
          {e.kind === "book_look" ? "Wants a look" : "Question"} ·{" "}
          {e.cars ? (
            <Link href={`/cars/${e.cars.slug}`} className="underline">
              {e.cars.year} {e.cars.make} {e.cars.model}
            </Link>
          ) : (
            "car removed"
          )}
          {e.preferred_time ? ` · ${e.preferred_time}` : ""}
        </p>
        {e.message && <p className="text-sm text-stone-600 mt-1">&ldquo;{e.message}&rdquo;</p>}
      </div>
      <span className="text-xs text-stone-400">{formatDateTime(e.created_at)}</span>
      <StatusBadge status={e.status} />
      <EnquiryActions enquiryId={e.id} status={e.status} />
    </div>
  );

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-6">Enquiries</h1>
      {open.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          Inbox zero. Buyer enquiries from car pages land here.
        </div>
      ) : (
        <div className="card divide-y divide-stone-100">{open.map(row)}</div>
      )}
      {closed.length > 0 && (
        <>
          <h2 className="font-bold text-stone-500 mt-8 mb-3">Closed</h2>
          <div className="card divide-y divide-stone-100 opacity-70">{closed.map(row)}</div>
        </>
      )}
    </div>
  );
}
