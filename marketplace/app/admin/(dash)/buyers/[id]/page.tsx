import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { formatDate, formatDateTime, formatPrice, carTitle } from "@/lib/format";
import type { Car, Enquiry } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import EnquiryActions from "@/components/admin/EnquiryActions";
import BuyerActions from "@/components/admin/BuyerActions";

/**
 * Everything the marketplace knows about one buyer, and the few things Adam
 * can do about it.
 *
 * Reads go through his own session wherever RLS allows it — profile,
 * enquiries and saved cars are all covered by the "admins can read" policies.
 * The service role is used for two things only: the email address and the
 * suspension state, both of which live on auth.users where PostgREST cannot
 * reach. requireAdmin() has run by then.
 */

export const dynamic = "force-dynamic";

const HEARD_ABOUT_LABELS: Record<string, string> = {
  radio: "Radio",
  google: "Google",
  social: "Social",
  friend: "Word of mouth",
  returning: "Been here before",
  other: "Other",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BuyerDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: profile } = await supabase
    .from("buyer_profiles")
    .select("id, full_name, phone, suburb, postcode, heard_about, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!profile) notFound();

  const [{ data: enquiries }, { data: saved }] = await Promise.all([
    supabase
      .from("enquiries")
      .select("*, cars(slug, make, model, year, badge)")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .returns<Enquiry[]>(),
    supabase
      .from("saved_cars")
      .select("created_at, cars(*)")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .returns<{ created_at: string; cars: Car | null }[]>(),
  ]);

  // Email and suspension live on auth.users.
  let email = "";
  let lastSignInAt: string | null = null;
  let suspended = false;
  try {
    const { data } = await createServiceClient().auth.admin.getUserById(id);
    email = data.user?.email ?? "";
    lastSignInAt = data.user?.last_sign_in_at ?? null;
    const bannedUntil = (data.user as { banned_until?: string } | null)?.banned_until;
    suspended = Boolean(bannedUntil && new Date(bannedUntil) > new Date());
  } catch (err) {
    console.error("BuyerDetailPage: could not read the auth record:", err);
  }

  const name = profile.full_name ?? "No name given";
  const savedCars = (saved ?? []).filter((s) => s.cars);
  const openEnquiries = (enquiries ?? []).filter((e) => e.status !== "closed").length;

  const facts: [string, string][] = [
    ["Email", email || "—"],
    ["Phone", profile.phone ?? "—"],
    ["Where", [profile.suburb, profile.postcode].filter(Boolean).join(" ") || "—"],
    ["Found us via", profile.heard_about ? (HEARD_ABOUT_LABELS[profile.heard_about] ?? profile.heard_about) : "—"],
    ["Joined", formatDate(profile.created_at)],
    ["Last signed in", lastSignInAt ? formatDateTime(lastSignInAt) : "Never"],
  ];

  return (
    <div>
      <Link href="/admin/buyers" className="btn-ghost text-sm -ml-3 mb-3">
        <ArrowLeft size={16} weight="bold" />
        Buyers
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h1 className="font-display font-extrabold text-2xl">{name}</h1>
        {suspended && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-soft text-[#8a5a1e]">
            Suspended
          </span>
        )}
      </div>
      <p className="text-sm text-stone-500 mb-6">
        {(enquiries ?? []).length === 0
          ? "No enquiries"
          : `${(enquiries ?? []).length} ${(enquiries ?? []).length === 1 ? "enquiry" : "enquiries"}${
              openEnquiries > 0 ? `, ${openEnquiries} still open` : ", all closed"
            }`}
        {" · "}
        {savedCars.length === 1 ? "1 car saved" : `${savedCars.length} cars saved`}
      </p>

      {/* Details */}
      <section className="card p-5 mb-6">
        <h2 className="font-bold mb-4">Their details</h2>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold text-stone-500">{k}</dt>
              <dd className="text-sm break-words">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Enquiries */}
      <section className="mb-6">
        <h2 className="font-bold mb-3">Their enquiries</h2>
        {(enquiries ?? []).length === 0 ? (
          <div className="card p-6 text-sm text-stone-500">
            Nothing yet. Enquiries they send while signed in show up here.
          </div>
        ) : (
          <div className="card divide-y divide-stone-100">
            {(enquiries ?? []).map((e) => (
              <div key={e.id} className="p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">
                    {e.cars ? (
                      <Link href={`/cars/${e.cars.slug}`} className="underline">
                        {e.cars.year} {e.cars.make} {e.cars.model}
                      </Link>
                    ) : (
                      "car removed"
                    )}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {e.kind === "book_look" ? "Wants a look" : "Question"}
                    {e.preferred_time ? ` · ${e.preferred_time}` : ""}
                    {" · "}
                    {formatDateTime(e.created_at)}
                    {e.financing_interest ? " · finance" : ""}
                    {e.trade_in_interest ? " · trade-in" : ""}
                  </p>
                  {e.message && (
                    <p className="text-xs text-stone-600 mt-1">&ldquo;{e.message}&rdquo;</p>
                  )}
                </div>
                <StatusBadge status={e.status} />
                {/* The same control the enquiries inbox uses, so a status
                    moved here means the same thing there. */}
                <EnquiryActions enquiryId={e.id} status={e.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved cars */}
      <section className="mb-6">
        <h2 className="font-bold mb-3">Cars they have saved</h2>
        {savedCars.length === 0 ? (
          <div className="card p-6 text-sm text-stone-500">
            Nothing saved yet.
          </div>
        ) : (
          <div className="card divide-y divide-stone-100">
            {savedCars.map((s) => {
              const car = s.cars as Car;
              return (
                <div key={car.id} className="p-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/inventory/${car.id}`}
                      className="font-semibold text-sm hover:text-forest-700"
                    >
                      {carTitle(car)}
                    </Link>
                    <p className="text-xs text-stone-500">
                      Saved {formatDate(s.created_at)} · {car.status}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular">{formatPrice(car.price)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Account controls, last and set apart. */}
      <section className="card p-5 border-red-100">
        <h2 className="font-bold mb-1">Account</h2>
        <p className="text-xs text-stone-500 mb-5">
          Changes here affect how {name} signs in.
        </p>
        <BuyerActions userId={profile.id} name={name} suspended={suspended} />
      </section>
    </div>
  );
}
