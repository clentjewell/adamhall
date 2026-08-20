import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { requireBuyer } from "@/lib/buyer";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import type { EnquiryContactMethod } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your enquiries",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  kind: "enquiry" | "book_look";
  preferred_time: string | null;
  message: string | null;
  preferred_contact_method: EnquiryContactMethod;
  financing_interest: boolean;
  trade_in_interest: boolean;
  status: "new" | "contacted" | "closed";
  created_at: string;
  cars: { slug: string; make: string; model: string; year: number } | null;
}

// Deliberately buyer-facing wording. The console calls these "new /
// contacted / closed", which is our pipeline, not something to show the
// person waiting for a call.
const STATUS_LABELS: Record<Row["status"], string> = {
  new: "Waiting on us",
  contacted: "We have been in touch",
  closed: "Wrapped up",
};

export default async function AccountEnquiriesPage() {
  await requireBuyer("/account/enquiries");

  // No user filter here: the "buyers read own enquiries" policy restricts
  // this to the signed-in person's rows at the database, so a bug in a filter
  // could never leak somebody else's.
  const supabase = await createClient();
  const { data } = await supabase
    .from("enquiries")
    .select(
      "id, kind, preferred_time, message, preferred_contact_method, financing_interest, trade_in_interest, status, created_at, cars(slug, make, model, year)",
    )
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  const rows = data ?? [];

  return (
    <section>
      <h2 className="type-card-title">Your enquiries</h2>
      <p className="text-sm text-stone-600 mt-1.5 max-w-[52ch]">
        Cars you have asked about since you signed in. Anything you sent
        before making an account is with us too, it just is not listed
        here.
      </p>

      {rows.length === 0 ? (
          <div className="card p-8 mt-8 text-center">
            <p className="font-semibold">Nothing yet</p>
            <p className="text-sm text-stone-600 mt-1">
              When you ask about a car it turns up here so you can see where it
              got to.
            </p>
            <Link href="/cars" className="btn-cta text-sm mt-5">
              Browse the cars
            </Link>
          </div>
      ) : (
          <ul className="card divide-y divide-stone-100 mt-8 list-none p-0">
            {rows.map((r) => {
              const extras = [
                r.financing_interest ? "finance" : null,
                r.trade_in_interest ? "a trade-in" : null,
              ].filter(Boolean);
              return (
                <li key={r.id} className="p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="font-semibold">
                      {r.cars ? (
                        <Link
                          href={`/cars/${r.cars.slug}`}
                          className="hover:text-forest-700"
                        >
                          {r.cars.year} {r.cars.make} {r.cars.model}
                        </Link>
                      ) : (
                        "A car that has since come off the site"
                      )}
                    </p>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-50 text-forest-700">
                      {STATUS_LABELS[r.status]}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">
                    {r.kind === "book_look" ? "Asked for a look" : "Asked a question"}
                    {r.preferred_time ? ` · ${r.preferred_time}` : ""}
                    {" · "}
                    {formatDateTime(r.created_at)}
                  </p>
                  {extras.length > 0 && (
                    <p className="text-sm text-stone-500 mt-0.5">
                      You mentioned {extras.join(" and ")}.
                    </p>
                  )}
                  {r.message && (
                    <p className="text-sm text-stone-600 mt-1.5">
                      &ldquo;{r.message}&rdquo;
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
      )}

    </section>
  );
}
