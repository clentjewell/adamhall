import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { formatDate, formatDateTime } from "@/lib/format";

/**
 * Everyone who has made a buyer account.
 *
 * Accounts were invisible from the console until this page: Adam could see
 * enquiries and submissions but had no way to know who had registered. A
 * registration is not a lead on its own, so this stays a list to look down
 * rather than a queue to work through; anything you can do to an account
 * lives one level in, on the profile.
 *
 * Reads go through the admin's own session wherever RLS allows it (the
 * "admins can read profiles" and "admins can read saved cars" policies).
 * Only the email addresses need the service role, because they live on
 * auth.users, which is not reachable through the normal API. requireAdmin()
 * has already run by then, so the elevated read is behind the same door as
 * the rest of the console.
 */

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  suburb: string | null;
  postcode: string | null;
  heard_about: string | null;
  created_at: string;
}

const HEARD_ABOUT_LABELS: Record<string, string> = {
  radio: "Radio",
  google: "Google",
  social: "Social",
  friend: "Word of mouth",
  returning: "Been here before",
  other: "Other",
};

export default async function BuyersPage() {
  const { supabase } = await requireAdmin();

  const { data: profiles } = await supabase
    .from("buyer_profiles")
    .select("id, full_name, phone, suburb, postcode, heard_about, created_at")
    .order("created_at", { ascending: false })
    .returns<ProfileRow[]>();

  const buyers = profiles ?? [];

  // How many cars each person has saved. Counted here rather than with a
  // join so one buyer with no saved cars still appears in the list.
  const { data: saved } = await supabase
    .from("saved_cars")
    .select("user_id")
    .returns<{ user_id: string }[]>();
  const savedCount = new Map<string, number>();
  for (const row of saved ?? []) {
    savedCount.set(row.user_id, (savedCount.get(row.user_id) ?? 0) + 1);
  }

  // Enquiries sent from a signed-in account. The far more useful signal than
  // a shortlist: this person has actually asked about a car.
  const { data: enquiries } = await supabase
    .from("enquiries")
    .select("user_id")
    .not("user_id", "is", null)
    .returns<{ user_id: string }[]>();
  const enquiryCount = new Map<string, number>();
  for (const row of enquiries ?? []) {
    enquiryCount.set(row.user_id, (enquiryCount.get(row.user_id) ?? 0) + 1);
  }

  // Emails and last-seen live on auth.users. listUsers is paginated; one page
  // of 1000 covers this yard many times over, and the fallback below means a
  // buyer past that still lists, just without an address.
  const details = new Map<
    string,
    { email: string; lastSignInAt: string | null; suspended: boolean }
  >();
  try {
    const { data: authUsers } = await createServiceClient().auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    for (const u of authUsers?.users ?? []) {
      const bannedUntil = (u as { banned_until?: string }).banned_until;
      details.set(u.id, {
        email: u.email ?? "",
        lastSignInAt: u.last_sign_in_at ?? null,
        suspended: Boolean(bannedUntil && new Date(bannedUntil) > new Date()),
      });
    }
  } catch (err) {
    console.error("BuyersPage: could not read auth users:", err);
  }

  return BuyersList({ buyers, savedCount, enquiryCount, details });
}

function BuyersList({
  buyers,
  savedCount,
  enquiryCount,
  details,
}: {
  buyers: ProfileRow[];
  savedCount: Map<string, number>;
  enquiryCount: Map<string, number>;
  details: Map<string, { email: string; lastSignInAt: string | null; suspended: boolean }>;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
        <h1 className="font-display font-extrabold text-2xl">Buyers</h1>
        <p className="text-sm text-stone-500">
          {buyers.length === 1 ? "1 account" : `${buyers.length} accounts`}
        </p>
      </div>
      <p className="text-sm text-stone-500 mb-6 max-w-[60ch]">
        People who have made an account so their saved cars follow them between
        devices. Registering is not an enquiry — you will hear from them
        separately if they want to talk about a car.
      </p>

      {buyers.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          Nobody has registered yet. Accounts made on the site turn up here.
        </div>
      ) : (
        <div className="card divide-y divide-stone-100">
          {buyers.map((b) => {
            const d = details.get(b.id);
            const where = [b.suburb, b.postcode].filter(Boolean).join(" ");
            const count = savedCount.get(b.id) ?? 0;
            const asked = enquiryCount.get(b.id) ?? 0;
            return (
              <div key={b.id} className="p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    <Link
                      href={`/admin/buyers/${b.id}`}
                      className="hover:text-forest-700 underline decoration-stone-300 underline-offset-2"
                    >
                      {b.full_name ?? "No name given"}
                    </Link>
                    {b.phone && (
                      <a href={`tel:${b.phone}`} className="ml-2 text-forest-700 text-sm font-bold">
                        {b.phone}
                      </a>
                    )}
                    {d?.email && (
                      <a
                        href={`mailto:${d.email}`}
                        className="ml-2 text-forest-700 text-sm font-bold break-all"
                      >
                        {d.email}
                      </a>
                    )}
                  </p>
                  <p className="text-sm text-stone-500">
                    Joined {formatDate(b.created_at)}
                    {where ? ` · ${where}` : ""}
                    {b.heard_about && HEARD_ABOUT_LABELS[b.heard_about]
                      ? ` · ${HEARD_ABOUT_LABELS[b.heard_about]}`
                      : ""}
                    {d?.lastSignInAt ? ` · last seen ${formatDateTime(d.lastSignInAt)}` : ""}
                  </p>
                </div>
                {/* Enquiries first: somebody who has asked about a car is
                    further along than somebody with a shortlist, who in turn
                    is further along than somebody who just signed up. */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {details.get(b.id)?.suspended && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-soft text-[#8a5a1e]">
                      Suspended
                    </span>
                  )}
                  {asked > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-soft text-[#8a5a1e]">
                      {asked === 1 ? "1 enquiry" : `${asked} enquiries`}
                    </span>
                  )}
                  {count > 0 ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-50 text-forest-700">
                      {count === 1 ? "1 car saved" : `${count} cars saved`}
                    </span>
                  ) : (
                    asked === 0 && (
                      <span className="text-xs text-stone-400">Nothing saved yet</span>
                    )
                  )}
                  <Link
                    href={`/admin/buyers/${b.id}`}
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-stone-400 mt-4">
        Buyer accounts have no access to this console.{" "}
        <Link href="/admin/enquiries" className="underline">
          Enquiries
        </Link>{" "}
        is where people asking about a car turn up.
      </p>
    </div>
  );
}
