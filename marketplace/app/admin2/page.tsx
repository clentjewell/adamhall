import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, formatPrice, formatKm, carTitle, timeAgo } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Car } from "@/lib/types";

/**
 * Redesigned dealer dashboard (route: /admin2), built to the "Carmarketplace
 * UI mockups" artifact, frame 1l.
 *
 * Same queries as the live dashboard, plus the inventory panel the artifact
 * adds beside the activity feed — read through the admin's own Supabase
 * client, so RLS applies exactly as it does everywhere else. requireAdmin()
 * is called here as well as in the layout: every admin page gates itself.
 */
export default async function Admin2Dashboard() {
  const { supabase } = await requireAdmin();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [newSubs, activeEnquiries, liveListings, soldThisMonth, recentEvents, inventory] =
    await Promise.all([
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("cars").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase
        .from("cars")
        .select("id", { count: "exact", head: true })
        .eq("status", "sold")
        .gte("sold_at", monthStart.toISOString()),
      supabase.from("status_events").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("cars").select("*").order("updated_at", { ascending: false }).limit(6),
    ]);

  const tiles = [
    {
      label: "New submissions",
      value: newSubs.count ?? 0,
      href: "/admin/submissions?status=new",
      attention: true,
    },
    { label: "Open enquiries", value: activeEnquiries.count ?? 0, href: "/admin/enquiries" },
    { label: "Live listings", value: liveListings.count ?? 0, href: "/admin/inventory" },
    { label: "Sold this month", value: soldThisMonth.count ?? 0, href: "/admin/inventory" },
  ];

  const cars = (inventory.data ?? []) as Car[];
  const events = recentEvents.data ?? [];

  return (
    <>
      <div className="mp2-console__head">
        <h1 className="mp2-console__title">Dashboard</h1>
        <p className="mp2-console__stamp">
          {formatDateTime(new Date().toISOString())}
        </p>
      </div>

      <div className="mp2-console__tiles">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="mp2-tile">
            {/* Amber is status-only: it marks the pile that needs attention,
                not a brand accent. */}
            <p className={`mp2-tile__value${t.attention && t.value > 0 ? " is-attention" : ""}`}>
              {t.value}
            </p>
            <p className="mp2-tile__label">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="mp2-console__panels">
        <section className="mp2-panel">
          <div className="mp2-panel__head">
            <h2>Inventory</h2>
            <Link href="/admin/inventory">View all &rarr;</Link>
          </div>
          {cars.length === 0 ? (
            <p className="mp2-panel__empty">
              No cars yet. Add one and it shows up here.
            </p>
          ) : (
            cars.map((car) => (
              <Link
                key={car.id}
                href={`/admin/inventory/${car.id}`}
                className="mp2-invrow"
              >
                <span className="mp2-invrow__thumb">
                  {car.photos?.[0] ? (
                    // Admin thumbnails are decorative and behind auth, so a
                    // plain img avoids the optimizer round-trip.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={car.photos[0].url} alt="" loading="lazy" />
                  ) : (
                    <em>no photo</em>
                  )}
                </span>
                <span className="mp2-invrow__text">
                  <b>{carTitle(car)}</b>
                  <em>
                    {formatKm(car.odometer_km)}
                    {car.status === "sold" && car.sold_at
                      ? ` · sold ${timeAgo(car.sold_at)}`
                      : car.published_at
                        ? ` · listed ${timeAgo(car.published_at)}`
                        : " · not yet visible"}
                  </em>
                </span>
                <StatusBadge status={car.status} />
                <span className="mp2-invrow__price">
                  {car.status === "draft" ? "—" : formatPrice(car.price)}
                </span>
              </Link>
            ))
          )}
        </section>

        <section className="mp2-panel">
          <div className="mp2-panel__head">
            <h2>Latest activity</h2>
          </div>
          {events.length === 0 ? (
            <p className="mp2-panel__empty">
              Nothing yet. Activity shows up here as submissions and listings
              move.
            </p>
          ) : (
            events.map((e) => (
              <div key={e.id} className="mp2-actrow">
                <StatusBadge status={e.to_status} />
                <span className="mp2-actrow__text">
                  {e.entity_type} · {e.actor}
                  {e.note ? ` — ${e.note}` : ""}
                </span>
                <span className="mp2-actrow__when">{timeAgo(e.created_at)}</span>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
