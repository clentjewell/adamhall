import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Car, EnquiryStatus } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import FinanceActions from "@/components/admin/FinanceActions";

interface FinanceEnquiry {
  id: string;
  car_id: string | null;
  name: string;
  phone: string;
  email: string;
  amount: number | null;
  deposit: number | null;
  term_months: number | null;
  message: string | null;
  consent: boolean;
  status: EnquiryStatus;
  created_at: string;
  cars?: Pick<Car, "slug" | "make" | "model" | "year"> | null;
}

export default async function FinanceQueuePage() {
  const { supabase } = await requireAdmin();
  const { data: enquiries } = await supabase
    .from("finance_enquiries")
    .select("*, cars(slug, make, model, year)")
    .order("created_at", { ascending: false })
    .returns<FinanceEnquiry[]>();

  const open = (enquiries ?? []).filter((e) => e.status !== "closed");
  const closed = (enquiries ?? []).filter((e) => e.status === "closed");

  const row = (e: FinanceEnquiry) => (
    <div key={e.id} className="p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {e.name}
          <a href={`tel:${e.phone}`} className="ml-2 text-forest-700 text-sm font-bold">
            {e.phone}
          </a>
        </p>
        <p className="text-sm text-stone-500 truncate">
          <a href={`mailto:${e.email}`} className="underline">
            {e.email}
          </a>
          {e.cars && (
            <>
              {" · "}
              <Link href={`/cars/${e.cars.slug}`} className="underline">
                {e.cars.year} {e.cars.make} {e.cars.model}
              </Link>
            </>
          )}
        </p>
        <p className="text-sm text-stone-600 mt-1">
          {e.amount ? `${formatPrice(e.amount)} to finance` : "Amount not given"}
          {e.deposit ? ` · ${formatPrice(e.deposit)} deposit` : ""}
          {e.term_months ? ` · ${e.term_months / 12} yr term` : ""}
        </p>
        {e.message && <p className="text-sm text-stone-600 mt-1">&ldquo;{e.message}&rdquo;</p>}
      </div>
      <span className="text-xs text-stone-400">{formatDateTime(e.created_at)}</span>
      <StatusBadge status={e.status} />
      <FinanceActions enquiryId={e.id} status={e.status} />
    </div>
  );

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-6">Finance enquiries</h1>
      {open.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          Inbox zero. Finance enquiries from the calculator land here.
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
