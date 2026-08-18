import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import type { Enquiry, EnquiryContactMethod } from "@/lib/types";

// How the buyer asked to be reached. Worded as an instruction to Adam, since
// that is the only thing this field is for.
const CONTACT_METHOD_LABELS: Record<EnquiryContactMethod, string> = {
  call: "Prefers a call",
  text: "Prefers a text",
  email: "Prefers email",
};
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
          {e.email && (
            <a href={`mailto:${e.email}`} className="ml-2 text-forest-700 text-sm font-bold">
              {e.email}
            </a>
          )}
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
          {" · "}
          {CONTACT_METHOD_LABELS[e.preferred_contact_method] ?? "Prefers a call"}
          {/* Most enquiries come from people with no account, so the marker
              only appears when there is one — worth knowing, because it means
              you can see their shortlist under Buyers. */}
          {e.user_id && (
            <>
              {" · "}
              <Link href="/admin/buyers" className="font-semibold text-forest-700 underline">
                has an account
              </Link>
            </>
          )}
          {e.preferred_time ? ` · ${e.preferred_time}` : ""}
        </p>
        {/* Only the ticked ones. Two more grey chips on every row would make
            the ones that matter harder to spot, not easier. */}
        {(e.financing_interest || e.trade_in_interest) && (
          <p className="flex flex-wrap gap-1.5 mt-1.5">
            {e.financing_interest && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-50 text-forest-700">
                Wants finance
              </span>
            )}
            {e.trade_in_interest && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-50 text-forest-700">
                Has a trade-in
              </span>
            )}
          </p>
        )}
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
